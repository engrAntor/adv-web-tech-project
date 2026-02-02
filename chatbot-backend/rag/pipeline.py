"""
RAG (Retrieval-Augmented Generation) Pipeline for the chatbot.
Uses FAISS for vector search and Google Gemini for response generation.
"""
import os
import numpy as np
from typing import List, Dict, Optional, Tuple
from django.conf import settings

try:
    import google.generativeai as genai
    GEMINI_AVAILABLE = True
except ImportError:
    GEMINI_AVAILABLE = False

try:
    from sentence_transformers import SentenceTransformer
    import faiss
    FAISS_AVAILABLE = True
except ImportError:
    FAISS_AVAILABLE = False


class RAGPipeline:
    """
    Retrieval-Augmented Generation pipeline.
    Retrieves relevant documents and generates responses using Gemini AI.
    """

    def __init__(self):
        self.gemini_model = None
        self.embedding_model = None
        self.index = None
        self.documents = []
        self._initialize()

    def _initialize(self):
        """Initialize the RAG components."""
        # Initialize Gemini
        if GEMINI_AVAILABLE and settings.GEMINI_API_KEY:
            try:
                genai.configure(api_key=settings.GEMINI_API_KEY)
                self.gemini_model = genai.GenerativeModel('gemini-pro')
            except Exception as e:
                print(f"Failed to initialize Gemini: {e}")

        # Initialize embedding model and FAISS
        if FAISS_AVAILABLE:
            try:
                self.embedding_model = SentenceTransformer('all-MiniLM-L6-v2')
                self.index = faiss.IndexFlatL2(384)  # 384 is the embedding dimension
            except Exception as e:
                print(f"Failed to initialize FAISS: {e}")

    def add_documents(self, documents: List[Dict[str, str]]):
        """
        Add documents to the knowledge base.

        Args:
            documents: List of dicts with 'title' and 'content' keys
        """
        if not FAISS_AVAILABLE or self.embedding_model is None:
            return

        for doc in documents:
            text = f"{doc.get('title', '')} {doc.get('content', '')}"
            embedding = self.embedding_model.encode([text])[0]
            self.index.add(np.array([embedding], dtype=np.float32))
            self.documents.append(doc)

    def load_documents_from_db(self):
        """Load documents and FAQs from database."""
        from api.models import Document, FAQ

        self.documents = []
        if self.index is not None:
            self.index.reset()

        # Load documents
        for doc in Document.objects.all():
            self.add_documents([{'title': doc.title, 'content': doc.content, 'type': 'document', 'id': doc.id}])

        # Load FAQs
        for faq in FAQ.objects.all():
            self.add_documents([{'title': faq.question, 'content': faq.answer, 'type': 'faq', 'id': faq.id}])

    def retrieve(self, query: str, top_k: int = 3) -> List[Dict]:
        """
        Retrieve relevant documents for a query.

        Args:
            query: User's question
            top_k: Number of documents to retrieve

        Returns:
            List of relevant documents with scores
        """
        if not FAISS_AVAILABLE or self.embedding_model is None or len(self.documents) == 0:
            return []

        try:
            query_embedding = self.embedding_model.encode([query])[0]
            query_embedding = np.array([query_embedding], dtype=np.float32)

            k = min(top_k, len(self.documents))
            distances, indices = self.index.search(query_embedding, k)

            results = []
            for i, (dist, idx) in enumerate(zip(distances[0], indices[0])):
                if idx < len(self.documents):
                    doc = self.documents[idx].copy()
                    doc['score'] = float(1 / (1 + dist))  # Convert distance to similarity score
                    results.append(doc)

            return results
        except Exception as e:
            print(f"Retrieval error: {e}")
            return []

    def generate_response(self, query: str, context: List[Dict] = None, chat_history: List[Dict] = None) -> Tuple[str, List[Dict]]:
        """
        Generate a response using the RAG pipeline.

        Args:
            query: User's question
            context: Retrieved documents (optional, will retrieve if not provided)
            chat_history: Previous messages in the conversation

        Returns:
            Tuple of (response text, retrieved documents)
        """
        # Retrieve relevant documents if not provided
        if context is None:
            context = self.retrieve(query)

        # Build the prompt
        prompt = self._build_prompt(query, context, chat_history)

        # Generate response
        if self.gemini_model is not None:
            try:
                response = self.gemini_model.generate_content(prompt)
                return response.text, context
            except Exception as e:
                print(f"Gemini generation error: {e}")
                return self._fallback_response(query, context), context
        else:
            return self._fallback_response(query, context), context

    def _build_prompt(self, query: str, context: List[Dict], chat_history: List[Dict] = None) -> str:
        """Build the prompt for the AI model."""
        prompt_parts = []

        # System instruction
        prompt_parts.append("""You are a helpful AI assistant for an online learning platform (LMS).
Your role is to help users with questions about courses, learning, and the platform.
Be concise, helpful, and friendly. If you don't know something, say so honestly.
Use the provided context to answer questions when relevant.""")

        # Add context from retrieved documents
        if context:
            prompt_parts.append("\n\n--- Relevant Information ---")
            for i, doc in enumerate(context, 1):
                prompt_parts.append(f"\n[{i}] {doc.get('title', 'Document')}")
                prompt_parts.append(f"   {doc.get('content', '')[:500]}")
            prompt_parts.append("\n--- End of Context ---\n")

        # Add chat history
        if chat_history:
            prompt_parts.append("\n--- Previous Conversation ---")
            for msg in chat_history[-6:]:  # Last 6 messages for context
                role = "User" if msg.get('role') == 'user' else "Assistant"
                prompt_parts.append(f"\n{role}: {msg.get('content', '')[:200]}")
            prompt_parts.append("\n--- End of History ---\n")

        # Add the current query
        prompt_parts.append(f"\nUser Question: {query}")
        prompt_parts.append("\nPlease provide a helpful response:")

        return "\n".join(prompt_parts)

    def _fallback_response(self, query: str, context: List[Dict]) -> str:
        """Generate a fallback response when AI is unavailable."""
        if context:
            # Return the most relevant document content directly
            best_doc = context[0]
            return best_doc.get('content', 'No content available.')
        else:
            return "I apologize, but I couldn't find relevant information for your query. Please try rephrasing your question or contact our support team for assistance."


# Global RAG pipeline instance
_rag_pipeline = None


def get_rag_pipeline() -> RAGPipeline:
    """Get or create the global RAG pipeline instance."""
    global _rag_pipeline
    if _rag_pipeline is None:
        _rag_pipeline = RAGPipeline()
        try:
            _rag_pipeline.load_documents_from_db()
        except Exception as e:
            print(f"Failed to load documents: {e}")
    return _rag_pipeline
