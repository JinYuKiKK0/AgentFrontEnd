import { useState, useCallback, useRef } from 'react';
import { ChatSession, CreateSessionRequest, ListSessionsRequest, DeleteSessionRequest, BatchDeleteSessionsRequest } from '../../../types/api';
import { ChatService } from '../services/chatService';

/**
 * 管理聊天会话的Hook
 */
export const useChatSessions = () => {
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
    append: boolean = false,
    isChainedCall: boolean = false
  ) => {
    if (!isChainedCall && loadingRef.current) {
      return;
    }

    if (!isChainedCall) {
      loadingRef.current = true;
      setLoading(true);
    }
    setError(null);

    try {
      const params: ListSessionsRequest = {
        lastConversationId,
        pageSize,
      };

      const newSessions = await ChatService.listSessions(params);

      if (append) {
        setSessions(prev => {
          const updatedSessions = [...prev, ...newSessions];
          return updatedSessions;
        });
      } else {
        setSessions(prevSessions => {
          return newSessions;
        });
      }

      setHasMore(newSessions.length === pageSize);
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载会话列表失败');
    } finally {
      if (!isChainedCall) {
        loadingRef.current = false;
        setLoading(false);
      }
    }
  }, []);

  /**
   * 创建新会话
   */
  const createSession = useCallback(async (title: string) => {
    if (loadingRef.current) {
      return;
    }
    
    loadingRef.current = true;
    setLoading(true);
    setError(null);

    try {
      const params: CreateSessionRequest = {
        title,
      };
      const conversationId = await ChatService.createSession(params);
      
      await loadSessions(undefined, 20, false, true); 
            
      return conversationId;
    } catch (err) {
      setError(err instanceof Error ? err.message : '创建会话失败');
      throw err;
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  }, [loadSessions]);

  /**
   * 删除会话
   */
  const deleteSession = useCallback(async (conversationId: string, clearChatMemory: boolean = true) => {
    if (loadingRef.current) {
      return;
    }

    loadingRef.current = true;
    setLoading(true);
    setError(null);

    try {
      const params: DeleteSessionRequest = {
        conversationId,
        clearChatMemory,
      };
      await ChatService.deleteSession(params);

      await loadSessions(undefined, 20, false, true); 
    } catch (err) {
      setError(err instanceof Error ? err.message : '删除会话失败');
      throw err;
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  }, [loadSessions]);

  /**
   * 批量删除会话
   */
  const batchDeleteSessions = useCallback(async (conversationIds: string[], clearChatMemory: boolean = true) => {
    if (loadingRef.current) {
      return;
    }

    loadingRef.current = true;
    setLoading(true);
    setError(null);

    try {
      const params: BatchDeleteSessionsRequest = {
        conversationIds,
        clearChatMemory
      };
      const deletedCount = await ChatService.batchDeleteSessions(params);

      await loadSessions(undefined, 20, false, true); 
      
      return deletedCount;
    } catch (err) {
      setError(err instanceof Error ? err.message : '批量删除会话失败');
      throw err;
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  }, [loadSessions]);

  /**
   * 加载更多会话（分页）
   */
  const loadMore = useCallback(() => {
    if (loadingRef.current) return;
    
    setSessions(currentSessions => {
      if (currentSessions.length > 0) {
        const lastSession = currentSessions[currentSessions.length - 1];
        setTimeout(() => {
          if (!loadingRef.current) {
            loadSessions(lastSession.conversationId, 20, true, false);
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
      loadSessions(undefined, 20, false, false);
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