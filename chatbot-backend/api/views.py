"""
API views for the chatbot application.
"""
from rest_framework import status, generics
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from django.shortcuts import get_object_or_404

from .models import User, ChatSession, ChatMessage, Document, FAQ
from .serializers import (
    UserSerializer, SignUpSerializer, LoginSerializer,
    ChatSessionSerializer, ChatSessionListSerializer, ChatMessageSerializer,
    ChatInputSerializer, DocumentSerializer, FAQSerializer
)

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from rag.pipeline import get_rag_pipeline
from tasks.scheduler import schedule_verification_email, generate_verification_token


class SignUpView(APIView):
    """
    POST /api/signup
    Register a new user.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = SignUpSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()

            # Generate verification token and schedule email
            verification_token = generate_verification_token()
            user.verification_token = verification_token
            user.save()

            # Schedule verification email as background task
            try:
                schedule_verification_email(user.email, user.username, verification_token)
            except Exception as e:
                print(f"Failed to schedule verification email: {e}")

            # Generate tokens
            refresh = RefreshToken.for_user(user)

            return Response({
                'message': 'User registered successfully. Please check your email for verification.',
                'user': UserSerializer(user).data,
                'access_token': str(refresh.access_token),
                'refresh_token': str(refresh),
            }, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginView(APIView):
    """
    POST /api/login
    Log in and receive a JWT token.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            user = serializer.validated_data['user']
            refresh = RefreshToken.for_user(user)

            return Response({
                'message': 'Login successful',
                'user': UserSerializer(user).data,
                'access_token': str(refresh.access_token),
                'refresh_token': str(refresh),
            }, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_401_UNAUTHORIZED)


class RefreshTokenView(APIView):
    """
    POST /api/refresh-token
    Refresh access token using refresh token.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        refresh_token = request.data.get('refresh_token')
        if not refresh_token:
            return Response({'error': 'Refresh token required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            refresh = RefreshToken(refresh_token)
            return Response({
                'access_token': str(refresh.access_token),
                'refresh_token': str(refresh),
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': 'Invalid or expired refresh token'}, status=status.HTTP_401_UNAUTHORIZED)


class VerifyEmailView(APIView):
    """
    POST /api/verify-email
    Verify user's email with token.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        token = request.data.get('token')
        if not token:
            return Response({'error': 'Verification token required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.get(verification_token=token)
            user.is_verified = True
            user.verification_token = None
            user.save()
            return Response({'message': 'Email verified successfully'}, status=status.HTTP_200_OK)
        except User.DoesNotExist:
            return Response({'error': 'Invalid verification token'}, status=status.HTTP_400_BAD_REQUEST)


class UserProfileView(APIView):
    """
    GET /api/profile
    Get current user's profile.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(UserSerializer(request.user).data)


class ChatHistoryView(APIView):
    """
    GET /api/chat-history
    Retrieve chat history for the logged-in user.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        sessions = ChatSession.objects.filter(user=request.user)
        serializer = ChatSessionListSerializer(sessions, many=True)
        return Response(serializer.data)


class ChatSessionDetailView(APIView):
    """
    GET /api/chat-history/<session_id>
    Get a specific chat session with all messages.

    DELETE /api/chat-history/<session_id>
    Delete a chat session.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, session_id):
        session = get_object_or_404(ChatSession, id=session_id, user=request.user)
        serializer = ChatSessionSerializer(session)
        return Response(serializer.data)

    def delete(self, request, session_id):
        session = get_object_or_404(ChatSession, id=session_id, user=request.user)
        session.delete()
        return Response({'message': 'Chat session deleted'}, status=status.HTTP_204_NO_CONTENT)


class ChatView(APIView):
    """
    POST /api/chat
    Send a message to the chatbot and receive a response.
    No authentication required - anyone can chat.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = ChatInputSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        user_message = serializer.validated_data['message']
        session_id = serializer.validated_data.get('session_id')

        # Get or create chat session
        if session_id:
            try:
                session = ChatSession.objects.get(id=session_id)
            except ChatSession.DoesNotExist:
                return Response({'error': 'Chat session not found'}, status=status.HTTP_404_NOT_FOUND)
        else:
            # Create new session with first message as title (no user required)
            title = user_message[:50] + '...' if len(user_message) > 50 else user_message
            # Use authenticated user if available, otherwise anonymous
            user = request.user if request.user.is_authenticated else None
            session = ChatSession.objects.create(user=user, title=title)

        # Save user message
        user_msg = ChatMessage.objects.create(
            session=session,
            role='user',
            content=user_message
        )

        # Get chat history for context
        chat_history = []
        for msg in session.messages.all()[:10]:  # Last 10 messages
            chat_history.append({
                'role': msg.role,
                'content': msg.content
            })

        # Generate response using RAG pipeline
        rag = get_rag_pipeline()
        response_text, retrieved_docs = rag.generate_response(
            query=user_message,
            chat_history=chat_history
        )

        # Save assistant response
        assistant_msg = ChatMessage.objects.create(
            session=session,
            role='assistant',
            content=response_text,
            retrieved_docs=[{'title': d.get('title'), 'score': d.get('score')} for d in retrieved_docs] if retrieved_docs else None
        )

        # Update session
        session.save()  # Updates updated_at

        return Response({
            'session_id': session.id,
            'user_message': ChatMessageSerializer(user_msg).data,
            'assistant_message': ChatMessageSerializer(assistant_msg).data,
            'retrieved_documents': [{'title': d.get('title'), 'type': d.get('type')} for d in retrieved_docs] if retrieved_docs else []
        }, status=status.HTTP_200_OK)


class NewChatView(APIView):
    """
    POST /api/chat/new
    Create a new chat session.
    No authentication required.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        title = request.data.get('title', 'New Chat')
        user = request.user if request.user.is_authenticated else None
        session = ChatSession.objects.create(user=user, title=title)
        return Response(ChatSessionSerializer(session).data, status=status.HTTP_201_CREATED)


class DocumentListView(generics.ListCreateAPIView):
    """
    GET /api/documents - List all documents
    POST /api/documents - Add a new document
    """
    queryset = Document.objects.all()
    serializer_class = DocumentSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        doc = serializer.save()
        # Add to RAG pipeline
        rag = get_rag_pipeline()
        rag.add_documents([{'title': doc.title, 'content': doc.content, 'type': 'document', 'id': doc.id}])


class FAQListView(generics.ListCreateAPIView):
    """
    GET /api/faqs - List all FAQs
    POST /api/faqs - Add a new FAQ
    """
    queryset = FAQ.objects.all()
    serializer_class = FAQSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        faq = serializer.save()
        # Add to RAG pipeline
        rag = get_rag_pipeline()
        rag.add_documents([{'title': faq.question, 'content': faq.answer, 'type': 'faq', 'id': faq.id}])


class HealthCheckView(APIView):
    """
    GET /api/health
    Health check endpoint.
    """
    permission_classes = [AllowAny]

    def get(self, request):
        return Response({
            'status': 'healthy',
            'service': 'LMS Chatbot API',
            'version': '1.0.0'
        })
