import { useState, useCallback, useRef } from 'react';
import { ChatSession, CreateSessionRequest, ListSessionsRequest } from '../../../types/api';
import { ChatService } from '../services/chatService';

/**
 * 管理聊天会话的Hook
 */
export const useChatSessions = (userId: string) => {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  
  // 使用ref来避免依赖循环
  const loadingRef = useRef(false);

  /**
   * 加载会话列表
   */
  const loadSessions = useCallback(async (
    lastConversationId?: string,
    pageSize: number = 20,
    append: boolean = false
  ) => {
    if (loadingRef.current) return;

    loadingRef.current = true;
    setLoading(true);
    setError(null);

    try {
      const params: ListSessionsRequest = {
        userId,
        lastConversationId,
        pageSize,
      };

      const newSessions = await ChatService.listSessions(params);
      
      if (append) {
        setSessions(prev => [...prev, ...newSessions]);
      } else {
        setSessions(newSessions);
      }

      // 如果返回的数据少于请求的页面大小，说明没有更多数据了
      setHasMore(newSessions.length === pageSize);
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载会话列表失败');
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  }, [userId]); // 只依赖userId

  /**
   * 创建新会话
   */
  const createSession = useCallback(async (title?: string) => {
    if (loadingRef.current) return;

    loadingRef.current = true;
    setLoading(true);
    setError(null);

    try {
      const params: CreateSessionRequest = {
        userId,
        title,
      };

      const conversationId = await ChatService.createSession(params);
      
      // 重新加载会话列表以获取最新数据
      await loadSessions();
      
      return conversationId;
    } catch (err) {
      setError(err instanceof Error ? err.message : '创建会话失败');
      throw err;
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  }, [userId, loadSessions]);

  /**
   * 删除会话
   */
  const deleteSession = useCallback(async (conversationId: string, clearChatMemory: boolean = true) => {
    if (loadingRef.current) return;

    loadingRef.current = true;
    setLoading(true);
    setError(null);

    try {
      await ChatService.deleteSession({
        userId,
        conversationId,
        clearChatMemory,
      });

      // 从本地状态中移除已删除的会话
      setSessions(prev => prev.filter(session => session.conversationId !== conversationId));
    } catch (err) {
      setError(err instanceof Error ? err.message : '删除会话失败');
      throw err;
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  }, [userId]);

  /**
   * 批量删除会话
   */
  const batchDeleteSessions = useCallback(async (conversationIds: string[], clearChatMemory: boolean = true) => {
    if (loadingRef.current) return;

    loadingRef.current = true;
    setLoading(true);
    setError(null);

    try {
      const deletedCount = await ChatService.batchDeleteSessions(
        { userId, clearChatMemory },
        conversationIds
      );

      // 从本地状态中移除已删除的会话
      setSessions(prev => prev.filter(session => !conversationIds.includes(session.conversationId)));
      
      return deletedCount;
    } catch (err) {
      setError(err instanceof Error ? err.message : '批量删除会话失败');
      throw err;
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  }, [userId]);

  /**
   * 加载更多会话（分页）
   */
  const loadMore = useCallback(() => {
    if (loadingRef.current) return;
    
    setSessions(currentSessions => {
      if (currentSessions.length > 0) {
        const lastSession = currentSessions[currentSessions.length - 1];
        // 使用setTimeout避免在render期间调用setState
        setTimeout(() => {
          if (!loadingRef.current) {
            loadSessions(lastSession.conversationId, 20, true);
          }
        }, 0);
      }
      return currentSessions;
    });
  }, [loadSessions]);

  /**
   * 刷新会话列表
   */
  const refresh = useCallback(() => {
    if (!loadingRef.current) {
      loadSessions();
    }
  }, [loadSessions]);

  return {
    sessions,
    loading,
    error,
    hasMore,
    loadSessions,
    createSession,
    deleteSession,
    batchDeleteSessions,
    loadMore,
    refresh,
  };
}; 