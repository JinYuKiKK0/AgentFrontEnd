import { useState, useRef, useEffect } from 'react';
import Head from 'next/head';
import ChatInput from '@/components/ChatInput';
import ChatMessage from '@/components/ChatMessage';
import { sendMessageStream } from '@/services/api';

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

    // 3. 调用SSE接口
    eventSourceRef.current = sendMessageStream(content, {
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
      },
    });
  };

  // 自动滚动到最新消息
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <Head>
        <title>AI 聊天助手</title>
        <meta name="description" content="基于AI的智能聊天助手" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <header className="bg-white shadow-sm py-4 px-6">
        <h1 className="text-xl font-semibold text-gray-800">AI 聊天助手</h1>
      </header>

      <main className="flex-1 overflow-hidden flex flex-col p-4">
        {/* 聊天消息区域 */}
        <div 
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto mb-4 space-y-4 p-2"
        >
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center p-6 max-w-md">
                <h2 className="text-2xl font-semibold text-gray-700 mb-2">欢迎使用AI聊天助手</h2>
                <p className="text-gray-500">输入您的问题，AI将为您提供回答。</p>
              </div>
            </div>
          ) : (
            messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))
          )}
          
          {loading && (
            <div className="flex items-center space-x-2 text-gray-500">
              <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
            </div>
          )}
        </div>

        {/* 输入区域 */}
        <ChatInput onSendMessage={handleSendMessage} disabled={loading} />
      </main>
    </div>
  );
}