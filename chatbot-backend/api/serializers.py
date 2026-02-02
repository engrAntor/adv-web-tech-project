"""
Serializers for the chatbot API.
"""
from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from django.contrib.auth import authenticate
from .models import User, ChatSession, ChatMessage, Document, FAQ


class UserSerializer(serializers.ModelSerializer):
    """Serializer for User model."""
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'is_verified', 'created_at']
        read_only_fields = ['id', 'is_verified', 'created_at']


class SignUpSerializer(serializers.ModelSerializer):
    """Serializer for user registration."""
    password = serializers.CharField(write_only=True, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'password_confirm']

    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({"password": "Passwords do not match."})
        return attrs

    def create(self, validated_data):
        validated_data.pop('password_confirm')
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password']
        )
        return user


class LoginSerializer(serializers.Serializer):
    """Serializer for user login."""
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        email = attrs.get('email')
        password = attrs.get('password')

        if email and password:
            user = authenticate(request=self.context.get('request'), username=email, password=password)
            if not user:
                raise serializers.ValidationError("Invalid email or password.")
            if not user.is_active:
                raise serializers.ValidationError("User account is disabled.")
        else:
            raise serializers.ValidationError("Email and password are required.")

        attrs['user'] = user
        return attrs


class ChatMessageSerializer(serializers.ModelSerializer):
    """Serializer for chat messages."""
    class Meta:
        model = ChatMessage
        fields = ['id', 'role', 'content', 'retrieved_docs', 'created_at']
        read_only_fields = ['id', 'role', 'retrieved_docs', 'created_at']


class ChatSessionSerializer(serializers.ModelSerializer):
    """Serializer for chat sessions."""
    messages = ChatMessageSerializer(many=True, read_only=True)
    message_count = serializers.SerializerMethodField()

    class Meta:
        model = ChatSession
        fields = ['id', 'title', 'created_at', 'updated_at', 'is_active', 'messages', 'message_count']
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_message_count(self, obj):
        return obj.messages.count()


class ChatSessionListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for listing chat sessions."""
    message_count = serializers.SerializerMethodField()
    last_message = serializers.SerializerMethodField()

    class Meta:
        model = ChatSession
        fields = ['id', 'title', 'created_at', 'updated_at', 'message_count', 'last_message']

    def get_message_count(self, obj):
        return obj.messages.count()

    def get_last_message(self, obj):
        last_msg = obj.messages.last()
        if last_msg:
            return {
                'content': last_msg.content[:100] + '...' if len(last_msg.content) > 100 else last_msg.content,
                'role': last_msg.role,
                'created_at': last_msg.created_at
            }
        return None


class ChatInputSerializer(serializers.Serializer):
    """Serializer for chat input."""
    message = serializers.CharField(max_length=4000)
    session_id = serializers.IntegerField(required=False, allow_null=True)


class DocumentSerializer(serializers.ModelSerializer):
    """Serializer for documents."""
    class Meta:
        model = Document
        fields = ['id', 'title', 'content', 'category', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class FAQSerializer(serializers.ModelSerializer):
    """Serializer for FAQs."""
    class Meta:
        model = FAQ
        fields = ['id', 'question', 'answer', 'category', 'created_at']
        read_only_fields = ['id', 'created_at']
