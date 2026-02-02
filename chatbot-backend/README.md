# LMS Chatbot Backend

A Django REST Framework backend for an AI-powered chatbot with RAG (Retrieval-Augmented Generation) pipeline, JWT authentication, and chat history management.

## Features

- **User Authentication**: JWT-based authentication with signup, login, and email verification
- **Chat History**: Persistent storage of chat sessions and messages
- **RAG Pipeline**: Document retrieval with FAISS + Google Gemini AI for response generation
- **Background Tasks**: APScheduler for automated cleanup of old chat history
- **Knowledge Base**: Documents and FAQs for context-aware responses

## Tech Stack

- **Framework**: Django 4.2 + Django REST Framework
- **Database**: SQLite (PostgreSQL ready)
- **Authentication**: JWT (djangorestframework-simplejwt)
- **AI Model**: Google Gemini Pro
- **Vector Search**: FAISS + Sentence Transformers
- **Background Tasks**: APScheduler

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/signup/` | Register a new user |
| POST | `/api/login/` | Login and receive JWT token |
| POST | `/api/refresh-token/` | Refresh access token |
| POST | `/api/verify-email/` | Verify email with token |

### Chat
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/chat/` | Send message and get AI response |
| POST | `/api/chat/new/` | Create new chat session |
| GET | `/api/chat-history/` | Get all chat sessions |
| GET | `/api/chat-history/<id>/` | Get specific session with messages |
| DELETE | `/api/chat-history/<id>/` | Delete a chat session |

### Knowledge Base
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET/POST | `/api/documents/` | List/create documents |
| GET/POST | `/api/faqs/` | List/create FAQs |

### Utility
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health/` | Health check |
| GET | `/api/profile/` | Get user profile |

## Setup Instructions

### 1. Create Virtual Environment
```bash
cd chatbot-backend
python -m venv venv

# Windows
venv\Scripts\activate

# Linux/Mac
source venv/bin/activate
```

### 2. Install Dependencies
```bash
pip install -r requirements.txt
```

### 3. Configure Environment
Create `.env` file (or edit existing):
```env
DJANGO_SECRET_KEY=your-secret-key
DEBUG=True
GEMINI_API_KEY=your-gemini-api-key
FRONTEND_URL=http://localhost:3001
```

### 4. Run Migrations
```bash
python manage.py makemigrations
python manage.py migrate
```

### 5. Seed Knowledge Base
```bash
python manage.py seed_knowledge_base
```

### 6. Create Superuser (Optional)
```bash
python manage.py createsuperuser
```

### 7. Run Server
```bash
python manage.py runserver 8000
```

Server runs at: http://localhost:8000

## RAG Pipeline

The chatbot uses a RAG (Retrieval-Augmented Generation) pipeline:

1. **Document Retrieval**: User queries are embedded using Sentence Transformers and matched against the knowledge base using FAISS vector search
2. **Context Building**: Top-k relevant documents are retrieved and added to the prompt context
3. **Response Generation**: Google Gemini Pro generates a response using the retrieved context and chat history

### Adding Documents
```python
# Via API
POST /api/documents/
{
    "title": "Course Guide",
    "content": "Detailed course information...",
    "category": "Courses"
}

# Via Management Command
python manage.py seed_knowledge_base
```

## Background Tasks

### Automatic Chat Cleanup
- Runs daily at midnight
- Deletes messages older than 30 days (configurable)
- Removes empty and inactive sessions

### Email Verification
- Triggered on user signup
- Sends verification email asynchronously

## Testing with Postman

### 1. Signup
```
POST http://localhost:8000/api/signup/
Content-Type: application/json

{
    "username": "testuser",
    "email": "test@example.com",
    "password": "SecurePass123!",
    "password_confirm": "SecurePass123!"
}
```

### 2. Login
```
POST http://localhost:8000/api/login/
Content-Type: application/json

{
    "email": "test@example.com",
    "password": "SecurePass123!"
}
```

### 3. Chat (requires token)
```
POST http://localhost:8000/api/chat/
Authorization: Bearer <access_token>
Content-Type: application/json

{
    "message": "How do I enroll in a course?"
}
```

## Security Measures

- Password hashing with Django's PBKDF2
- JWT tokens with short expiry (15 min access, 7 day refresh)
- CORS protection configured
- Input validation on all endpoints
- Email verification for new accounts

## Configuration

| Variable | Description | Default |
|----------|-------------|---------|
| `DJANGO_SECRET_KEY` | Django secret key | Required |
| `DEBUG` | Debug mode | True |
| `GEMINI_API_KEY` | Google Gemini API key | Required for AI |
| `CHAT_HISTORY_RETENTION_DAYS` | Days to keep chat history | 30 |
| `FRONTEND_URL` | Frontend URL for emails | http://localhost:3001 |

## Deployment

### Railway/Render
1. Set environment variables
2. Use Gunicorn: `gunicorn chatbot_project.wsgi:application`
3. Run migrations on deploy

### Docker (Optional)
```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["gunicorn", "chatbot_project.wsgi:application", "--bind", "0.0.0.0:8000"]
```

## License

MIT License
