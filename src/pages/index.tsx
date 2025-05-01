import { useState, useRef, useEffect } from 'react';
import Head from 'next/head';
import ChatInput from '@/components/ChatInput';
import ChatMessage from '@/components/ChatMessage';
import ThemeToggle from '@/components/ThemeToggle';
import { sendMessageStream } from '@/services/api';
import { getSessionId } from '@/utils/sessionManager';
import { initTheme } from '@/utils/themeManager';

/**
 * 聊天消息类型定义
 */
export interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

/**
 * 主页组件 - 展示聊天界面
 */
export default function Home() {
  // 聊天消息列表状态
  const [messages, setMessages] = useState<Message[]>([]);
  // 加载状态
  const [loading, setLoading] = useState(false);
  // 聊天容器引用，用于自动滚动
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // 存储当前SSE连接的引用
  const eventSourceRef = useRef<{ close: () => void } | null>(null);

  /**
   * 处理消息发送（流式）
   * @param content 用户输入的内容
   */
  const handleSendMessage = (content: string) => {
    if (!content.trim() || loading) return;

    // 如果存在上一个流式连接，先关闭它
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }

    // 1. 添加用户消息
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      content,
      isUser: true,
      timestamp: new Date(),
    };

    // 2. 添加一个空的AI消息占位符，用于后续填充
    const aiMessageId = `ai-${Date.now()}`;
    const initialAiMessage: Message = {
      id: aiMessageId,
      content: '', // 初始为空
      isUser: false,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage, initialAiMessage]);
    setLoading(true);
    
    // 获取当前会话ID
    const sessionId = getSessionId();

    // 3. 调用SSE接口，传递会话ID
    eventSourceRef.current = sendMessageStream(
      content,
      {
      /**
       * 接收到消息块时的处理
       * @param chunk 收到的文本块
       */
      onMessage: (chunk) => {
        setMessages((prevMessages) =>
          prevMessages.map((msg) =>
            msg.id === aiMessageId
              ? { ...msg, content: msg.content + chunk } // 将新块附加到现有内容
              : msg
          )
        );
      },
      /**
       * 发生错误时的处理
       * @param error 错误对象
       */
      onError: (error) => {
        console.error('SSE 接收错误:', error);
        setMessages((prevMessages) =>
          prevMessages.map((msg) =>
            msg.id === aiMessageId
              ? { ...msg, content: '抱歉，发生错误，请稍后再试。' }
              : msg
          )
        );
        setLoading(false);
        eventSourceRef.current = null; // 清理引用
      },
      /**
       * 连接关闭时的处理
       */
      onClose: () => {
        setLoading(false);
        eventSourceRef.current = null; // 清理引用
        console.log('SSE 连接已关闭');
      }
      },
      sessionId
    );
  };

  // 自动滚动到最新消息
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // 初始化主题
  useEffect(() => {
    initTheme();
  }, []);

  return (
    <div className="flex flex-col h-screen bg-neutral-50 dark:bg-[#343541]">
      <Head>
        <title>AI 聊天助手</title>
        <meta name="description" content="基于AI的智能聊天助手" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <header className="bg-white dark:bg-neutral-800 shadow-soft py-4 px-6 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto w-full flex items-center justify-between">
          <h1 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">Effective Agent</h1>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-primary-600 dark:text-primary-400 font-medium">询问任何事情</div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-hidden flex flex-col p-4 sm:p-6 max-w-4xl mx-auto w-full">
        {/* 聊天容器 */}
        <div className="flex-1 flex flex-col overflow-hidden chat-container mb-4">
          {/* 聊天消息区域 */}
          <div 
            ref={chatContainerRef}
            className="flex-1 overflow-y-auto py-6 px-2 sm:px-4 dark:bg-[#343541]"
          >
            {messages.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center p-6 max-w-md">
                  <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary-600 dark:text-primary-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-semibold text-neutral-800 dark:text-neutral-100 mb-6">有什么可以帮忙的？</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left max-w-sm mx-auto">
                    <div className="p-3 bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 shadow-sm">
                      <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">"如何使用React Hooks?"</p>
                    </div>
                    <div className="p-3 bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 shadow-sm">
                      <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">"解释一下闭包的概念"</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-1">
                {messages.map((message) => (
                  <ChatMessage key={message.id} message={message} />
                ))}
              </div>
            )}
            
            {loading && (
              <div className="pl-3 mt-2">
                <div className="typing-indicator">
                  <div className="w-2 h-2 bg-primary-400 rounded-full animate-pulse"></div>
                  <div className="w-2 h-2 bg-primary-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-primary-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            )}
          </div>
          
          {/* 输入区域 - 固定在底部 */}
          <div className="p-4 border-t border-neutral-200 dark:border-neutral-700 bg-white dark:bg-[#343541] rounded-b-xl">
            <ChatInput onSendMessage={handleSendMessage} disabled={loading} />
          </div>
        </div>
      </main>
    </div>
  );
}