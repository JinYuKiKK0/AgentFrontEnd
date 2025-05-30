import { api } from '../../../services/apiClient';
import apiClient from '../../../services/apiClient';
import {
  ChatSession,
  CreateSessionRequest,
  CreateSessionResponse,
  ListSessionsRequest,
  ListSessionsResponse,
  DeleteSessionRequest,
  DeleteSessionResponse,
  BatchDeleteSessionsRequest,
  BatchDeleteSessionsResponse,
  ChatRequest,
  ChatMessageVO,
  GetChatHistoryRequest,
  ChatMessage
} from '../../../types/api';

// Helper function to map ChatMessageVO to ChatMessage
const mapChatMessageVOToChatMessage = (vo: ChatMessageVO): ChatMessage => {
  // Use vo.type for prefix, ensure it's a string
  const typePrefix = typeof vo.type === 'string' && vo.type.length > 0 ? vo.type.substring(0, 1).toUpperCase() : 'M';
  const randomSuffix = Math.random().toString(36).substring(2, 7);

  return {
    id: `${vo.timestamp}-${typePrefix}-${randomSuffix}`,
    // Defensive toUpperCase comparison for role mapping
    role: typeof vo.type === 'string' && vo.type.toUpperCase() === 'USER' ? 'user' : 'assistant',
    content: vo.content, // Use vo.content
    timestamp: vo.timestamp,
    conversationId: vo.conversationId,
    // userId field removed from ChatMessage, so no mapping here
  };
};

/**
 * 聊天相关的API服务
 */
export class ChatService {
  /**
   * 创建新的聊天会话
   */
  static async createSession(params: CreateSessionRequest): Promise<string> {
    const requestBody = params.title;
    const response = await api.post<string>('/session', requestBody);
    return response.data.data ?? '';
  }

  /**
   * 获取历史会话列表（游标分页）
   */
  static async listSessions(params: ListSessionsRequest): Promise<ChatSession[]> {
    const response = await api.get<ChatSession[]>('/session/list', { params });
    return response.data.data ?? [];
  }

  /**
   * 删除聊天会话
   */
  static async deleteSession(params: DeleteSessionRequest): Promise<boolean> {
    const { conversationId, clearChatMemory } = params;
    const response = await api.delete<boolean>(`/session/${conversationId}`, {
      params: { clearChatMemory } 
    });
    return response.data.data ?? false;
  }

  /**
   * 批量删除聊天会话
   */
  static async batchDeleteSessions(
    requestPayload: BatchDeleteSessionsRequest
  ): Promise<number> {
    const { conversationIds, clearChatMemory } = requestPayload;
    const response = await api.delete<number>('/session/batch-delete', {
      params: { clearChatMemory },
      data: conversationIds
    });
    return response.data.data ?? 0;
  }

  /**
   * 创建SSE连接进行聊天
   * 返回EventSource实例，调用者需要自行管理连接的生命周期
   */
  static createChatStream(params: ChatRequest): EventSource {
    const CHAT_API_HOST = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
    const fullChatEndpoint = `${CHAT_API_HOST}/api/Aria/ai/chat`;
    const url = new URL(fullChatEndpoint);

    url.searchParams.append('prompt', params.prompt);
    url.searchParams.append('conversationId', params.conversationId);

    const eventSource = new EventSource(url.toString(), {
      withCredentials: true
    });
    
    return eventSource;
  }

  /**
   * 获取指定会话的聊天记录（游标分页）
   */
  static async getChatHistory(params: GetChatHistoryRequest): Promise<ChatMessage[]> {
    const { conversationId, ...queryParams } = params;
    
    const filteredQueryParams: Record<string, string | number> = {};
    if (queryParams.lastMessageTimeStamp) {
      filteredQueryParams.lastMessageTimeStamp = queryParams.lastMessageTimeStamp;
    }
    if (queryParams.pageSize) {
      filteredQueryParams.pageSize = queryParams.pageSize;
    }

    const response = await api.get<{ code: number; message: string; data?: ChatMessageVO[] }>(
      // Assuming apiClient is configured with /api/Aria base path
      `/session/history/${conversationId}`,
      { params: filteredQueryParams }
    );

    const vos = response.data?.data; // Optional chaining for data access
    if (Array.isArray(vos)) {
      return vos.map(mapChatMessageVOToChatMessage);
    }
    return []; // Return empty array if vos is not an array (e.g. undefined)
  }
}

export default ChatService; 