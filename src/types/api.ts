// API 相关类型定义

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  conversationId: string;
}

export interface ChatRequest {
  message: string;
  conversationId: string;
  userId?: string;
  prompt?: string;
  chatId?: string;
}

export interface ChatSession {
  conversationId: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
  lastMessage?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface CreateSessionRequest {
  title?: string;
  userId: string;
}

export interface CreateSessionResponse {
  conversationId: string;
  title: string;
  createdAt: string;
  userId: string;
}

export interface UpdateSessionRequest {
  title?: string;
}

export interface ListSessionsRequest {
  userId: string;
  page?: number;
  limit?: number;
  lastConversationId?: string;
  pageSize?: number;
}

export interface ListSessionsResponse {
  sessions: ChatSession[];
  total: number;
  hasMore: boolean;
}

export interface DeleteSessionRequest {
  conversationId: string;
  userId: string;
  clearChatMemory?: boolean;
}

export interface DeleteSessionResponse {
  success: boolean;
  message?: string;
}

export interface BatchDeleteSessionsRequest {
  conversationIds: string[];
  userId: string;
  clearChatMemory?: boolean;
}

export interface BatchDeleteSessionsResponse {
  success: boolean;
  deletedCount: number;
  message?: string;
} 