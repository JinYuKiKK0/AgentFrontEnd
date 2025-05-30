import { useState, useCallback, useRef, useEffect } from 'react';
import { ChatMessage, ChatRequest, GetChatHistoryRequest } from '../../../types/api';
import { ChatService } from '../services/chatService';

const DEFAULT_PAGE_SIZE = 20;

/**
 * SSE聊天Hook - 使用双重实现策略
 */
export const useSSEChat = () => {
  const CHAT_API_HOST = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
  const CHAT_API_ENDPOINT_PATH = '/api/Aria/ai/chat';
  
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentMessage, setCurrentMessage] = useState<string>('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [sseError, setSseError] = useState<string | null>(null);
  
  // States for historical message loading
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [hasMoreHistory, setHasMoreHistory] = useState(true);
  const [newestLoadedTimestamp, setNewestLoadedTimestamp] = useState<string | null>(null);

  const eventSourceRef = useRef<EventSource | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const currentConversationIdRef = useRef<string>('');
  const currentMessageRef = useRef<string>('');
  const isStreamingRef = useRef<boolean>(false);
  const streamEndedRef = useRef<boolean>(false);
  const errorTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * 清理当前的连接
   */
  const cleanupSSE = useCallback(() => {
    // 清除错误延迟处理
    if (errorTimeoutRef.current) {
      clearTimeout(errorTimeoutRef.current);
      errorTimeoutRef.current = null;
    }
    
    // 清理EventSource
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }

    // 清理fetch abort controller
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    
    isStreamingRef.current = false;
    streamEndedRef.current = false;
    setIsStreaming(false);
    setCurrentMessage('');
    currentMessageRef.current = '';
  }, []);

  /**
   * 使用fetch + ReadableStream的SSE实现
   */
  const sendMessageWithFetch = useCallback(async (prompt: string, conversationId: string) => {
    cleanupSSE();
    setSseError(null);
    setIsStreaming(true);
    isStreamingRef.current = true;
    streamEndedRef.current = false;
    currentConversationIdRef.current = conversationId;
    currentMessageRef.current = '';

    // 添加用户消息
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: prompt,
      timestamp: new Date().toISOString(),
      conversationId,
    };
    setMessages(prev => [...prev, userMessage]);

    try {
      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      const fullChatEndpoint = `${CHAT_API_HOST}${CHAT_API_ENDPOINT_PATH}`;
      const url = new URL(fullChatEndpoint);
      url.searchParams.append('prompt', prompt);
      url.searchParams.append('conversationId', conversationId);

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Accept': 'text/event-stream',
          'Cache-Control': 'no-cache',
        },
        signal: abortController.signal,
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      if (!response.body) {
        throw new Error('Response body is null');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = ''; // 累积缓冲区，处理跨chunk的数据

      try {
        while (true) {
          const { done, value } = await reader.read();
          
          if (!isStreamingRef.current) {
            break;
          }

          // 处理接收到的数据块
          if (value) {
            const chunk = decoder.decode(value, { stream: true });
            buffer += chunk;
            
            // 按行分割处理
            const lines = buffer.split('\n');
            
            // 保留最后一行（可能不完整），其余行进行处理
            buffer = lines.pop() || '';
            
            for (const line of lines) {
              if (line.startsWith('data:')) {
                const data = line.slice(5); // 移除 'data:' 前缀
                if (data.trim()) {
                  currentMessageRef.current += data;
                  setCurrentMessage(prev => prev + data);
                }
              }
            }
          }
          
          if (done) {
            // 处理缓冲区中剩余的数据
            if (buffer.trim()) {
              const lines = buffer.split('\n');
              for (const line of lines) {
                if (line.startsWith('data:')) {
                  const data = line.slice(5);
                  if (data.trim()) {
                    currentMessageRef.current += data;
                    setCurrentMessage(prev => prev + data);
                  }
                }
              }
            }
            
            // 流结束时，确保保存完整的消息
            if (currentMessageRef.current.trim()) {
              const assistantMessage: ChatMessage = {
                id: `assistant-${Date.now()}`,
                role: 'assistant',
                content: currentMessageRef.current,
                timestamp: new Date().toISOString(),
                conversationId,
              };
              setMessages(prev => [...prev, assistantMessage]);
            }
            
            setCurrentMessage('');
            setIsStreaming(false);
            isStreamingRef.current = false;
            streamEndedRef.current = true;
            break;
          }
        }
      } finally {
        reader.releaseLock();
      }

    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        return;
      }
      
      console.error('Fetch stream error:', err);
      setSseError(err instanceof Error ? err.message : '发送消息失败');
      setIsStreaming(false);
      isStreamingRef.current = false;
    }
  }, [cleanupSSE]);

  /**
   * 使用EventSource的SSE实现（备用）
   */
  const sendMessageWithEventSource = useCallback(async (prompt: string, conversationId: string) => {
    cleanupSSE();
    setSseError(null);
    setIsStreaming(true);
    isStreamingRef.current = true;
    streamEndedRef.current = false;
    currentConversationIdRef.current = conversationId;
    currentMessageRef.current = '';

    // 添加用户消息到消息列表
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: prompt,
      timestamp: new Date().toISOString(),
      conversationId,
    };

    setMessages(prev => [...prev, userMessage]);

    try {
      const chatRequest: ChatRequest = {
        prompt,
        conversationId: conversationId,
      };

      const eventSource = ChatService.createChatStream(chatRequest);
      eventSourceRef.current = eventSource;

      // 处理SSE消息
      eventSource.onmessage = (event) => {
        // 检查连接是否还有效
        if (!isStreamingRef.current || eventSourceRef.current !== eventSource) {
          return;
        }

        const data = event.data;
        
        // 累积消息内容
        currentMessageRef.current += data;
        setCurrentMessage(prev => prev + data);
      };

      // 处理SSE错误
      eventSource.onerror = (event) => {
        // 如果EventSource状态是CLOSED，且我们有消息内容，则视为正常结束
        if (eventSource.readyState === EventSource.CLOSED) {
          if (currentMessageRef.current.trim() && isStreamingRef.current) {
            // 保存消息
            const finalMessage = currentMessageRef.current;
            const assistantMessage: ChatMessage = {
              id: `assistant-${Date.now()}`,
              role: 'assistant',
              content: finalMessage,
              timestamp: new Date().toISOString(),
              conversationId,
            };

            setMessages(prev => [...prev, assistantMessage]);
            setCurrentMessage('');
            setIsStreaming(false);
            isStreamingRef.current = false;
            streamEndedRef.current = true;
            eventSourceRef.current = null;
            return;
          }
        }
        
        // 如果流已经结束，忽略错误
        if (!isStreamingRef.current || streamEndedRef.current) {
          return;
        }
        
        // 其他情况才视为真正的错误
        setSseError('连接中断，请重试');
        setIsStreaming(false);
        isStreamingRef.current = false;
        cleanupSSE();
      };

      // 处理连接打开
      eventSource.onopen = () => {
        setSseError(null); // 清除之前的错误
      };

    } catch (err) {
      console.error('Send message error:', err);
      setSseError(err instanceof Error ? err.message : '发送消息失败');
      setIsStreaming(false);
      isStreamingRef.current = false;
    }
  }, [cleanupSSE]);

  /**
   * 主要的发送消息函数 - 优先使用fetch实现
   */
  const sendMessage = useCallback(async (prompt: string, conversationId: string) => {
    // 首先尝试使用fetch实现
    try {
      await sendMessageWithFetch(prompt, conversationId);
    } catch (err) {
      // 如果fetch失败，回退到EventSource
      await sendMessageWithEventSource(prompt, conversationId);
    }
  }, [sendMessageWithFetch, sendMessageWithEventSource]);

  /**
   * 停止当前的流
   */
  const stopStreaming = useCallback(() => {
    isStreamingRef.current = false;
    cleanupSSE();
  }, [cleanupSSE]);

  /**
   * 清空消息历史
   */
  const clearChatState = useCallback(() => {
    setMessages([]);
    // SSE related states reset by cleanupSSE
    cleanupSSE(); 
    setSseError(null);

    // History related states
    setIsLoadingHistory(false);
    setHistoryError(null);
    setHasMoreHistory(true); // Reset for a new session
    setNewestLoadedTimestamp(null);
    // currentConversationIdRef.current = ''; // Cleared when new one is set
  }, [cleanupSSE]);

  /**
   * 加载指定会话的消息历史
   * 注意：这里需要根据实际后端API来实现
   * 目前后端没有提供获取历史消息的接口，所以这里只是一个占位符
   */
  const loadMessagesInternal = useCallback(async (conversationId: string, isLoadMore: boolean) => {
    if (isLoadingHistory) {
      console.log('loadMessagesInternal: Already loading history, returning.');
      return;
    }
    if (isLoadMore && (!hasMoreHistory || !newestLoadedTimestamp)) {
      console.log('loadMessagesInternal: No more history or no timestamp for loadMore, returning.');
      return;
    }

    console.log(`loadMessagesInternal: Called for ${conversationId}, isLoadMore: ${isLoadMore}`);
    setIsLoadingHistory(true);
    setHistoryError(null);

    const requestParams: GetChatHistoryRequest = {
      conversationId,
      pageSize: DEFAULT_PAGE_SIZE,
    };

    if (isLoadMore && newestLoadedTimestamp) {
      requestParams.lastMessageTimeStamp = newestLoadedTimestamp;
    }

    try {
      const newlyFetchedMessages = await ChatService.getChatHistory(requestParams);
      console.log('loadMessagesInternal: Fetched messages:', newlyFetchedMessages);
      
      if (isLoadMore) {
        setMessages(prev => [...prev, ...newlyFetchedMessages]);
      } else {
        setMessages(newlyFetchedMessages);
      }

      if (newlyFetchedMessages.length > 0) {
        setNewestLoadedTimestamp(newlyFetchedMessages[newlyFetchedMessages.length - 1].timestamp);
      }
      setHasMoreHistory(newlyFetchedMessages.length === DEFAULT_PAGE_SIZE);

    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : '加载历史消息失败';
      console.error('loadMessagesInternal: Error:', errorMsg, err);
      setHistoryError(errorMsg);
      if (!isLoadMore) setMessages([]); // Clear messages on initial load failure
    } finally {
      setIsLoadingHistory(false);
      console.log('loadMessagesInternal: Finished.');
    }
  }, []);

  const loadInitialChatMessages = useCallback((conversationId: string) => {
    console.log(`loadInitialChatMessages: Called for ${conversationId}`);
    clearChatState();
    currentConversationIdRef.current = conversationId;
    loadMessagesInternal(conversationId, false);
  }, [clearChatState, loadMessagesInternal]);

  const loadMoreChatHistory = useCallback(() => {
    if (currentConversationIdRef.current) {
      console.log(`loadMoreChatHistory: Called for ${currentConversationIdRef.current}`);
      loadMessagesInternal(currentConversationIdRef.current, true);
    } else {
      console.warn('loadMoreChatHistory: No currentConversationIdRef.current');
    }
  }, [loadMessagesInternal]);

  // 组件卸载时清理资源
  useEffect(() => {
    return () => {
      cleanupSSE();
    };
  }, [cleanupSSE]);

  return {
    messages,
    currentMessage,
    isStreaming,
    sseError,
    sendMessage,
    stopStreaming,
    clearChatState,
    // History related exports
    isLoadingHistory,
    historyError,
    hasMoreHistory,
    loadInitialChatMessages,
    loadMoreChatHistory,
    currentConversationId: currentConversationIdRef.current,
  };
}; 