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
} from '../../../types/api';

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
}

export default ChatService; 