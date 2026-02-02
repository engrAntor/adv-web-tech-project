from django.apps import AppConfig


class ApiConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'api'

    def ready(self):
        # Start background scheduler when app is ready
        import os
        if os.environ.get('RUN_MAIN', None) != 'true':
            return  # Avoid running twice in development

        try:
            from tasks.scheduler import start_scheduler
            start_scheduler()
        except Exception as e:
            print(f"Failed to start scheduler: {e}")
