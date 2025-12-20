import api from './api';

export interface ChatMessage {
  id: number;
  conversation_id: number;
  sender_type: 'user' | 'admin';
  sender_id: number;
  sender: {
    id: number;
    name: string;
    avatar: string | null;
  };
  content: string;
  type: 'text' | 'image' | 'file';
  attachment_url: string | null;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
}

export interface Conversation {
  id: number;
  subject: string | null;
  status: 'open' | 'closed' | 'pending';
  user: {
    id: number;
    name: string;
    email: string;
    avatar: string | null;
    is_online: boolean;
    last_seen_at: string | null;
  };
  admin: {
    id: number;
    name: string;
    avatar: string | null;
  } | null;
  last_message: {
    id: number;
    content: string;
    sender_type: 'user' | 'admin';
    created_at: string;
  } | null;
  messages: ChatMessage[];
  user_unread_count: number;
  admin_unread_count: number;
  last_message_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface SendMessageData {
  content: string;
  type?: 'text' | 'image' | 'file';
  attachment_url?: string;
}

// API response wrapper for Laravel Resources
interface ApiResponse<T> {
  data: T;
}

export const chatService = {
  /**
   * Get or create conversation for current user.
   */
  async getConversation(): Promise<Conversation> {
    const response = await api.get<ApiResponse<Conversation>>('/chat/conversation');
    return response.data.data;
  },

  /**
   * Get messages for user's conversation.
   */
  async getMessages(limit = 50, beforeId?: number): Promise<{ data: ChatMessage[]; conversation_id: number }> {
    const params = new URLSearchParams();
    params.append('limit', limit.toString());
    if (beforeId) {
      params.append('before_id', beforeId.toString());
    }
    const response = await api.get<{ data: ChatMessage[]; conversation_id: number }>(`/chat/messages?${params}`);
    return response.data;
  },

  /**
   * Send a message.
   */
  async sendMessage(data: SendMessageData): Promise<ChatMessage> {
    const response = await api.post<ApiResponse<ChatMessage>>('/chat/messages', data);
    return response.data.data;
  },

  /**
   * Mark messages as read.
   */
  async markAsRead(): Promise<void> {
    await api.post('/chat/read');
  },

  /**
   * Get unread count.
   */
  async getUnreadCount(): Promise<number> {
    const response = await api.get<{ unread_count: number }>('/chat/unread-count');
    return response.data.unread_count;
  },

  /**
   * Send heartbeat to update online status.
   */
  async heartbeat(): Promise<void> {
    await api.post('/chat/heartbeat');
  },
};

export default chatService;
