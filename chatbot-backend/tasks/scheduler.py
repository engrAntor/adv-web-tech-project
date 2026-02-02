"""
Background tasks using APScheduler.
Handles periodic cleanup and email verification.
"""
import os
import uuid
from datetime import timedelta
from django.utils import timezone
from django.conf import settings
from django.core.mail import send_mail
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger
from apscheduler.triggers.interval import IntervalTrigger

scheduler = BackgroundScheduler()


def cleanup_old_chat_history():
    """
    Delete chat messages and sessions older than CHAT_HISTORY_RETENTION_DAYS.
    Runs daily at midnight.
    """
    from api.models import ChatSession, ChatMessage

    retention_days = getattr(settings, 'CHAT_HISTORY_RETENTION_DAYS', 30)
    cutoff_date = timezone.now() - timedelta(days=retention_days)

    # Delete old messages
    old_messages = ChatMessage.objects.filter(created_at__lt=cutoff_date)
    message_count = old_messages.count()
    old_messages.delete()

    # Delete empty sessions
    empty_sessions = ChatSession.objects.filter(messages__isnull=True)
    session_count = empty_sessions.count()
    empty_sessions.delete()

    # Delete old inactive sessions
    old_sessions = ChatSession.objects.filter(
        updated_at__lt=cutoff_date,
        is_active=False
    )
    old_session_count = old_sessions.count()
    old_sessions.delete()

    print(f"[Cleanup] Deleted {message_count} old messages, {session_count} empty sessions, {old_session_count} old inactive sessions")


def send_verification_email(user_email: str, username: str, verification_token: str):
    """
    Send verification email to new users.
    Called as a background task after user signup.
    """
    try:
        subject = 'Verify your email - LMS Chatbot'
        verification_url = f"{settings.FRONTEND_URL}/verify-email?token={verification_token}"
        message = f"""
Hello {username},

Thank you for signing up for our LMS Chatbot service!

Please verify your email by clicking the link below:
{verification_url}

If you didn't create this account, please ignore this email.

Best regards,
LMS Platform Team
        """

        send_mail(
            subject=subject,
            message=message,
            from_email=settings.EMAIL_HOST_USER or 'noreply@lmsplatform.com',
            recipient_list=[user_email],
            fail_silently=False,
        )
        print(f"[Email] Verification email sent to {user_email}")
    except Exception as e:
        print(f"[Email] Failed to send verification email to {user_email}: {e}")


def generate_verification_token() -> str:
    """Generate a unique verification token."""
    return str(uuid.uuid4())


def schedule_verification_email(user_email: str, username: str, verification_token: str):
    """Schedule verification email as a background task."""
    scheduler.add_job(
        send_verification_email,
        args=[user_email, username, verification_token],
        trigger=IntervalTrigger(seconds=1),  # Run almost immediately
        id=f'verify_email_{user_email}',
        replace_existing=True,
        max_instances=1
    )


def start_scheduler():
    """Start the background scheduler."""
    if not scheduler.running:
        # Schedule daily cleanup at midnight
        scheduler.add_job(
            cleanup_old_chat_history,
            trigger=CronTrigger(hour=0, minute=0),
            id='cleanup_chat_history',
            replace_existing=True,
        )

        scheduler.start()
        print("[Scheduler] Background scheduler started")


def stop_scheduler():
    """Stop the background scheduler."""
    if scheduler.running:
        scheduler.shutdown()
        print("[Scheduler] Background scheduler stopped")
