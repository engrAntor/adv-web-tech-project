"""
URL patterns for the chatbot API.
"""
from django.urls import path
from .views import (
    SignUpView, LoginView, RefreshTokenView, VerifyEmailView,
    UserProfileView, ChatHistoryView, ChatSessionDetailView,
    ChatView, NewChatView, DocumentListView, FAQListView, HealthCheckView
)

urlpatterns = [
    # Health check
    path('health/', HealthCheckView.as_view(), name='health'),

    # Authentication
    path('signup/', SignUpView.as_view(), name='signup'),
    path('login/', LoginView.as_view(), name='login'),
    path('refresh-token/', RefreshTokenView.as_view(), name='refresh-token'),
    path('verify-email/', VerifyEmailView.as_view(), name='verify-email'),

    # User
    path('profile/', UserProfileView.as_view(), name='profile'),

    # Chat
    path('chat/', ChatView.as_view(), name='chat'),
    path('chat/new/', NewChatView.as_view(), name='new-chat'),
    path('chat-history/', ChatHistoryView.as_view(), name='chat-history'),
    path('chat-history/<int:session_id>/', ChatSessionDetailView.as_view(), name='chat-session-detail'),

    # Knowledge base
    path('documents/', DocumentListView.as_view(), name='documents'),
    path('faqs/', FAQListView.as_view(), name='faqs'),
]
