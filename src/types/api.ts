// API 相关类型定义

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  conversationId: string;
}

export interface ChatRequest {
  prompt: string;
  conversationId: string;
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
  code: number;      // 状态码，200表示成功，其他表示错误
  message: string;   // 提示信息
  data?: T;          // 实际返回的数据
  // success: boolean; // 根据后端规范，移除 success
  // error?: string;    // 根据后端规范，移除 error
}

export interface CreateSessionRequest {
  title: string;
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
  clearChatMemory?: boolean;
}

export interface DeleteSessionResponse {
  success: boolean;
  message?: string;
}

export interface BatchDeleteSessionsRequest {
  conversationIds: string[];
  clearChatMemory?: boolean;
}

export interface BatchDeleteSessionsResponse {
  success: boolean;
  deletedCount: number;
  message?: string;
}

// New Types for Chat History
export interface ChatMessageVO {
  conversationId: string;
  content: string;
  type: string;
  timestamp: string;
}

export interface GetChatHistoryRequest {
  conversationId: string;
  lastMessageTimeStamp?: string;
  pageSize?: number;
} 