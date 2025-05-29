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
    const response = await api.get<ChatSession[]>('/session', { params });
    return response.data.data ?? [];
  }

  /**
   * 删除聊天会话
   */
  static async deleteSession(params: DeleteSessionRequest): Promise<boolean> {
    const { conversationId, userId, clearChatMemory } = params;
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
    const { conversationIds, userId, clearChatMemory } = requestPayload;
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
    const baseURL = apiClient.defaults.baseURL;
    if (!baseURL) {
      throw new Error('API base URL is not configured.');
    }
    const url = new URL('/ai/chat', baseURL);

    if (params.prompt === undefined || params.chatId === undefined) {
      throw new Error('Prompt and chatId are required for creating a chat stream.');
    }
    url.searchParams.append('prompt', params.prompt);
    url.searchParams.append('chatId', params.chatId);

    const eventSource = new EventSource(url.toString(), {
      withCredentials: false
    });
    
    return eventSource;
  }
}

export default ChatService; 