import { useState, useCallback, useRef, useEffect } from 'react';
import { ChatMessage, ChatRequest } from '../../../types/api';
import { ChatService } from '../services/chatService';

/**
 * SSE聊天Hook - 使用双重实现策略
 */
export const useSSEChat = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentMessage, setCurrentMessage] = useState<string>('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
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
  const cleanup = useCallback(() => {
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
    cleanup();
    setError(null);
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

      const url = new URL('/ai/chat', 'http://localhost:8080');
      url.searchParams.append('prompt', prompt);
      url.searchParams.append('chatId', conversationId);

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Accept': 'text/event-stream',
          'Cache-Control': 'no-cache',
        },
        signal: abortController.signal,
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
      setError(err instanceof Error ? err.message : '发送消息失败');
      setIsStreaming(false);
      isStreamingRef.current = false;
    }
  }, [cleanup]);

  /**
   * 使用EventSource的SSE实现（备用）
   */
  const sendMessageWithEventSource = useCallback(async (prompt: string, conversationId: string) => {
    cleanup();
    setError(null);
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
        chatId: conversationId,
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
        setError('连接中断，请重试');
        setIsStreaming(false);
        isStreamingRef.current = false;
        cleanup();
      };

      // 处理连接打开
      eventSource.onopen = () => {
        setError(null); // 清除之前的错误
      };

    } catch (err) {
      console.error('Send message error:', err);
      setError(err instanceof Error ? err.message : '发送消息失败');
      setIsStreaming(false);
      isStreamingRef.current = false;
    }
  }, [cleanup]);

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
    cleanup();
  }, [cleanup]);

  /**
   * 清空消息历史
   */
  const clearMessages = useCallback(() => {
    setMessages([]);
    setCurrentMessage('');
    currentMessageRef.current = '';
    streamEndedRef.current = false;
  }, []);

  /**
   * 加载指定会话的消息历史
   * 注意：这里需要根据实际后端API来实现
   * 目前后端没有提供获取历史消息的接口，所以这里只是一个占位符
   */
  const loadMessages = useCallback((conversationId: string) => {
    // TODO: 实现加载历史消息的逻辑
    // 当后端提供相应API时，在这里调用
    currentConversationIdRef.current = conversationId;
    setMessages([]);
    setCurrentMessage('');
    currentMessageRef.current = '';
    streamEndedRef.current = false;
  }, []);

  // 组件卸载时清理资源
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  return {
    messages,
    currentMessage,
    isStreaming,
    error,
    sendMessage,
    stopStreaming,
    clearMessages,
    loadMessages,
    currentConversationId: currentConversationIdRef.current,
  };
}; 