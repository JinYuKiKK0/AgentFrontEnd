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
    const response = await api.post<string>('/session/create', null, {
      params
    } as any);
    return response.data.data;
  }

  /**
   * 获取历史会话列表（游标分页）
   */
  static async listSessions(params: ListSessionsRequest): Promise<ChatSession[]> {
    const response = await api.get<ChatSession[]>('/session/list', {
      params
    } as any);
    return response.data.data;
  }

  /**
   * 删除聊天会话
   */
  static async deleteSession(params: DeleteSessionRequest): Promise<boolean> {
    const response = await api.delete<boolean>('/session/delete', {
      params
    } as any);
    return response.data.data;
  }

  /**
   * 批量删除聊天会话
   */
  static async batchDeleteSessions(
    params: Omit<BatchDeleteSessionsRequest, 'conversationIds'>,
    conversationIds: string[]
  ): Promise<number> {
    const response = await api.delete<number>('/session/batch-delete', {
      params,
      data: conversationIds
    } as any);
    return response.data.data;
  }

  /**
   * 创建SSE连接进行聊天
   * 返回EventSource实例，调用者需要自行管理连接的生命周期
   */
  static createChatStream(params: ChatRequest): EventSource {
    const baseURL = apiClient.defaults.baseURL || 'http://localhost:8080';
    const url = new URL('/ai/chat', baseURL);
    url.searchParams.append('prompt', params.prompt);
    url.searchParams.append('chatId', params.chatId);

    // 创建EventSource时可以添加配置
    const eventSource = new EventSource(url.toString(), {
      withCredentials: false // 根据需要设置
    });
    
    return eventSource;
  }
}

export default ChatService; 