
import os
import sys
import django

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'chatbot_project.settings')
django.setup()

from api.views import ChatView
from rest_framework.request import Request
from rest_framework.test import APIRequestFactory

factory = APIRequestFactory()
request = factory.post('/api/chat', {'message': 'Hello'}, format='json')

print("Testing ChatView...")
view = ChatView.as_view()
try:
    response = view(request)
    print(f"Status Code: {response.status_code}")
    print(f"Data: {response.data}")
except Exception:
    import traceback
    traceback.print_exc()
