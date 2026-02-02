/**
 * Chatbot API Service
 * Connects to the Django chatbot backend
 */

const CHATBOT_API_URL = process.env.NEXT_PUBLIC_CHATBOT_API_URL || 'http://localhost:8000/api';

interface ChatMessage {
  id: number;
  role: 'user' | 'assistant';
  content: string;
  retrieved_docs?: { title: string; score: number }[];
  created_at: string;
}

interface ChatSession {
  id: number;
  title: string;
  created_at: string;
  updated_at: string;
  message_count: number;
  last_message?: {
    content: string;
    role: string;
    created_at: string;
  };
}

interface ChatSessionDetail extends ChatSession {
  messages: ChatMessage[];
}

interface ChatResponse {
  session_id: number;
  user_message: ChatMessage;
  assistant_message: ChatMessage;
  retrieved_documents: { title: string; type: string }[];
}

interface AuthResponse {
  access_token: string;
  refresh_token: string;
  user: {
    id: number;
    username: string;
    email: string;
    is_verified: boolean;
  };
}

class ChatbotService {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;

  constructor() {
    // Load tokens from localStorage on init
    if (typeof window !== 'undefined') {
      this.accessToken = localStorage.getItem('chatbot_access_token');
      this.refreshToken = localStorage.getItem('chatbot_refresh_token');
    }
  }

  private async fetchWithAuth(endpoint: string, options: RequestInit = {}): Promise<Response> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    };

    if (this.accessToken) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${this.accessToken}`;
    }

    const response = await fetch(`${CHATBOT_API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    // Handle token refresh on 401
    if (response.status === 401 && this.refreshToken) {
      const refreshed = await this.refreshAccessToken();
      if (refreshed) {
        (headers as Record<string, string>)['Authorization'] = `Bearer ${this.accessToken}`;
        return fetch(`${CHATBOT_API_URL}${endpoint}`, { ...options, headers });
      }
    }

    return response;
  }

  private async refreshAccessToken(): Promise<boolean> {
    try {
      const response = await fetch(`${CHATBOT_API_URL}/refresh-token/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: this.refreshToken }),
      });

      if (response.ok) {
        const data = await response.json();
        this.setTokens(data.access_token, data.refresh_token);
        return true;
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
    }
    this.clearTokens();
    return false;
  }

  private setTokens(accessToken: string, refreshToken: string): void {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    if (typeof window !== 'undefined') {
      localStorage.setItem('chatbot_access_token', accessToken);
      localStorage.setItem('chatbot_refresh_token', refreshToken);
    }
  }

  private clearTokens(): void {
    this.accessToken = null;
    this.refreshToken = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('chatbot_access_token');
      localStorage.removeItem('chatbot_refresh_token');
    }
  }

  isAuthenticated(): boolean {
    return !!this.accessToken;
  }

  // Authentication
  async signup(username: string, email: string, password: string): Promise<AuthResponse> {
    const response = await fetch(`${CHATBOT_API_URL}/signup/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password, password_confirm: password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || JSON.stringify(error));
    }

    const data = await response.json();
    this.setTokens(data.access_token, data.refresh_token);
    return data;
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await fetch(`${CHATBOT_API_URL}/login/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Login failed');
    }

    const data = await response.json();
    this.setTokens(data.access_token, data.refresh_token);
    return data;
  }

  logout(): void {
    this.clearTokens();
  }

  // Chat
  async sendMessage(message: string, sessionId?: number): Promise<ChatResponse> {
    const response = await this.fetchWithAuth('/chat/', {
      method: 'POST',
      body: JSON.stringify({ message, session_id: sessionId }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to send message');
    }

    return response.json();
  }

  async createNewChat(title?: string): Promise<ChatSessionDetail> {
    const response = await this.fetchWithAuth('/chat/new/', {
      method: 'POST',
      body: JSON.stringify({ title: title || 'New Chat' }),
    });

    if (!response.ok) {
      throw new Error('Failed to create chat');
    }

    return response.json();
  }

  async getChatHistory(): Promise<ChatSession[]> {
    const response = await this.fetchWithAuth('/chat-history/');

    if (!response.ok) {
      throw new Error('Failed to fetch chat history');
    }

    return response.json();
  }

  async getChatSession(sessionId: number): Promise<ChatSessionDetail> {
    const response = await this.fetchWithAuth(`/chat-history/${sessionId}/`);

    if (!response.ok) {
      throw new Error('Failed to fetch chat session');
    }

    return response.json();
  }

  async deleteChatSession(sessionId: number): Promise<void> {
    const response = await this.fetchWithAuth(`/chat-history/${sessionId}/`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Failed to delete chat session');
    }
  }

  // Health check
  async healthCheck(): Promise<{ status: string; service: string; version: string }> {
    const response = await fetch(`${CHATBOT_API_URL}/health/`);
    return response.json();
  }
}

export const chatbotService = new ChatbotService();
export type { ChatMessage, ChatSession, ChatSessionDetail, ChatResponse, AuthResponse };
