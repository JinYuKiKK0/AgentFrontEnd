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
    // 使用 CSS 变量设置 body 背景
    <div className="flex flex-col h-screen bg-[rgb(var(--background-rgb))] text-[rgb(var(--foreground-rgb))]" >
      <Head>
        <title>AI 聊天助手</title>
        <meta name="description" content="基于AI的智能聊天助手" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* 简化 Header - 更像 ChatGPT */}
      <header className="bg-transparent py-3 px-4 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto w-full flex items-center justify-between">
          {/* 居中标题或留空，这里暂时保留标题 */}
          {/* <h1 className="text-lg font-medium text-[rgb(var(--foreground-rgb))] opacity-80">ChatGPT</h1> */}
          {/* 占位符，保持右侧按钮位置 */}
          <div></div>
          <div className="flex items-center">
            <ThemeToggle />
            {/* 可以添加其他图标按钮，如新建聊天等 */}
          </div>
        </div>
      </header>

      {/* 调整 Main 布局以更像 ChatGPT */}
      {/* 移除 overflow-hidden，让页面根元素处理滚动 */}
      {/* 根据是否有消息动态添加 pb */}
      <main className={`flex-1 flex flex-col pt-2 sm:pt-4 max-w-3xl mx-auto w-full min-h-0 ${messages.length > 0 ? 'pb-24 sm:pb-28' : 'pb-4'}`}>
        {/* 聊天容器 - 根据是否有消息调整样式 */}
        {/* 移除 flex-1 和 overflow-y-auto */}
        <div
          ref={chatContainerRef}
          // 移除 justify-center，添加 pt-20
          // 移除 mb-4
          className={`py-6 px-2 sm:px-4 chat-container ${messages.length === 0 ? 'flex flex-col flex-1 pt-20' : ''}`}
        >
          {messages.length === 0 ? (
            // 移除 pb-32
            <div className="p-6 flex flex-col">
              {/* 给 h2 单独添加 text-center */} 
              <h2 className="text-3xl font-semibold text-[rgb(var(--foreground-rgb))] mb-12 opacity-90 text-center">有什么可以帮忙的？</h2>
              {/* 在空状态下，输入框显示在这里 */} 
              <div className="w-full">
                <ChatInput onSendMessage={handleSendMessage} disabled={loading} />
              </div>
            </div>
          ) : (
            // 显示聊天消息
            <div className="space-y-1">
              {messages.map((message) => (
                <ChatMessage key={message.id} message={message} />
              ))}
            </div>
          )}

          {/* 加载指示器 - 仅在有消息时显示在消息列表下方 */}
          {loading && messages.length > 0 && (
            <div className="pl-3 mt-2">
              <div className="typing-indicator">
                <div className="w-2 h-2 bg-[rgb(var(--primary-600))] rounded-full animate-pulse"></div>
                <div className="w-2 h-2 bg-[rgb(var(--primary-600))] rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 bg-[rgb(var(--primary-600))] rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          )}
        </div>

        {/* 输入区域 - 移出 main，作为根 div 的子元素 (仅在有消息时) */}
        {/* 删除这部分，将其移动到 main 外部的条件渲染中 */}
      </main>

      {/* 输入区域 - 仅在有消息时固定在页面底部 */}
      {messages.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 w-full bg-[rgb(var(--background-rgb))] pt-2 pb-4 sm:pb-6 z-30 px-2 sm:px-4">
          {/* 容器限制宽度并居中 */}
          <div className="max-w-3xl mx-auto">
            <div>
              <ChatInput onSendMessage={handleSendMessage} disabled={loading} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}