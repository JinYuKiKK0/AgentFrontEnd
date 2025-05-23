import { useState, useRef, useEffect, useCallback } from 'react';
import Head from 'next/head';
import ChatInput from '@/components/ChatInput';
import ChatMessage from '@/components/ChatMessage';
import ThemeToggle from '@/components/ThemeToggle';
import ConversationSidebar from '@/components/ConversationSidebar';
import {
  sendMessageStream,
  getUserConversations,
  createConversation,
  deleteConversation,
  ApiConversation,
} from '@/services/api';
import { logoutUser } from '@/services/userService';
import { 
  generateLocalId, 
  getActiveConversationIdFromStorage, 
  setActiveConversationIdInStorage,
  clearActiveConversationIdFromStorage 
} from '@/utils/sessionManager';
import { getUserId, clearUserId } from '@/utils/user';
import { initTheme } from '@/utils/themeManager';
import { Bars3Icon, XMarkIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/router';

/**
 * 聊天消息类型定义
 */
export interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

// 新增：用于存储每个会话消息的类型
type ConversationMessages = Record<string, Message[]>;

const MESSAGES_STORAGE_KEY = 'chatAppAllMessages'; // 新增 localStorage key

/**
 * 主页组件 - 展示聊天界面
 */
export default function Home() {
  const [messages, setMessages] = useState<ConversationMessages>(() => {
    // 初始化时尝试从 localStorage 加载消息
    if (typeof window !== 'undefined') {
      const savedMessages = localStorage.getItem(MESSAGES_STORAGE_KEY);
      if (savedMessages) {
        try {
          return JSON.parse(savedMessages);
        } catch (error) {
          console.error('解析localStorage中的消息失败:', error);
          return {};
        }
      }
    }
    return {};
  });
  const [sendingMessage, setSendingMessage] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const eventSourceRef = useRef<{ close: () => void } | null>(null);

  const [conversations, setConversations] = useState<ApiConversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [userId, setUserIdState] = useState<string | null>(null);
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isProcessingConversation, setIsProcessingConversation] = useState(false);
  const router = useRouter();

  // 获取当前活动会话的消息列表
  const currentMessages = currentConversationId ? messages[currentConversationId] || [] : [];

  useEffect(() => {
    const uId = getUserId();
    if (!uId) {
      router.push('/login');
      return;
    }
    setUserIdState(uId);
    initTheme();

    if (uId) {
      loadConversations(uId);
      const lastActiveId = getActiveConversationIdFromStorage();
      if (lastActiveId) {
        setCurrentConversationId(lastActiveId);
      }
    }
  }, [router]);

  // 当 messages 状态变化时，将其保存到 localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(MESSAGES_STORAGE_KEY, JSON.stringify(messages));
    }
  }, [messages]);

  useEffect(() => {
    if (currentConversationId) {
      setActiveConversationIdInStorage(currentConversationId);
      if (!messages[currentConversationId]) {
        setMessages(prev => ({ ...prev, [currentConversationId]: [] }));
      }
    } else {
      clearActiveConversationIdFromStorage();
    }
  }, [currentConversationId, messages]);

  const loadConversations = useCallback(async (uid: string) => {
    setIsLoadingConversations(true);
    try {
      const convs = await getUserConversations(uid);
      convs.sort((a, b) => new Date(b.updateTime).getTime() - new Date(a.updateTime).getTime());
      setConversations(convs);
      
      const lastActiveId = getActiveConversationIdFromStorage();
      let activeIdToSet = null;

      if (lastActiveId && convs.some(c => c.conversationId === lastActiveId)) {
        activeIdToSet = lastActiveId;
      } else if (convs.length > 0) {
        activeIdToSet = convs[0].conversationId;
      }

      if (activeIdToSet && activeIdToSet !== currentConversationId) {
        setCurrentConversationId(activeIdToSet);
      } else if (!activeIdToSet && currentConversationId) {
        setCurrentConversationId(null);
      }

    } catch (error) {
      console.error('加载会话列表失败:', error);
    } finally {
      setIsLoadingConversations(false);
    }
  }, [currentConversationId]);

  const handleSelectConversation = (conversationId: string) => {
    if (currentConversationId === conversationId || isProcessingConversation) return;
    setCurrentConversationId(conversationId);
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
      setSendingMessage(false);
    }
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  };

  const handleCreateConversation = async () => {
    if (!userId || isProcessingConversation) return;
    setIsProcessingConversation(true);
    try {
      const newConversation = await createConversation({ userId, title: '新对话' });
      setConversations((prev) => [newConversation, ...prev].sort((a, b) => new Date(b.updateTime).getTime() - new Date(a.updateTime).getTime()));
      setMessages(prev => ({ ...prev, [newConversation.conversationId]: [] }));
      setCurrentConversationId(newConversation.conversationId);
      if (window.innerWidth < 768) {
        setIsSidebarOpen(false);
      }
    } catch (error) {
      console.error('创建新会话失败:', error);
    } finally {
      setIsProcessingConversation(false);
    }
  };

  const handleDeleteConversation = async (conversationIdToDelete: string) => {
    if (!userId || isProcessingConversation) return;
    const isConfirmed = window.confirm('确定要删除此会话吗？此操作不可撤销。');
    if (!isConfirmed) return;

    setIsProcessingConversation(true);
    try {
      await deleteConversation(conversationIdToDelete);
      const updatedConversations = conversations.filter(conv => conv.conversationId !== conversationIdToDelete);
      setConversations(updatedConversations);
      
      setMessages(prev => {
        const newMessages = { ...prev };
        delete newMessages[conversationIdToDelete];
        return newMessages;
      });

      if (currentConversationId === conversationIdToDelete) {
        if (updatedConversations.length > 0) {
          setCurrentConversationId(updatedConversations[0].conversationId);
        } else {
          setCurrentConversationId(null);
        }
      }
    } catch (error) {
      console.error('删除会话失败:', error);
    } finally {
      setIsProcessingConversation(false);
    }
  };

  const handleLogout = async () => {
    const confirmLogout = window.confirm('您确定要登出吗？');
    if (!confirmLogout) {
      return;
    }
    try {
      await logoutUser();
      localStorage.removeItem('token');
      localStorage.removeItem(MESSAGES_STORAGE_KEY);
      clearActiveConversationIdFromStorage();
      clearUserId();

      setMessages({});
      setConversations([]);
      setCurrentConversationId(null);
      setUserIdState(null);
      
      router.push('/login');
    } catch (error) {
      console.error('登出失败:', error);
      alert('登出失败，请稍后重试。');
    }
  };

  const handleSendMessage = async (content: string) => {
    if (!content.trim() || sendingMessage || !userId) return;

    let conversationToUse = currentConversationId;

    if (!conversationToUse) {
      if (isProcessingConversation) return;
      setIsProcessingConversation(true);
      try {
        const newConv = await createConversation({ userId, title: content.substring(0, 30) });
        setConversations(prev => [newConv, ...prev].sort((a, b) => new Date(b.updateTime).getTime() - new Date(a.updateTime).getTime()));
        setMessages(prev => ({ ...prev, [newConv.conversationId]: [] }));
        setCurrentConversationId(newConv.conversationId);
        conversationToUse = newConv.conversationId;
      } catch (error) {
        console.error('发送消息前创建新会话失败:', error);
        setIsProcessingConversation(false);
        return;
      } finally {
        setIsProcessingConversation(false);
      }
    }
    
    if (!conversationToUse) return;

    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }

    const userMessage: Message = {
      id: generateLocalId(),
      content,
      isUser: true,
      timestamp: new Date(),
    };

    const aiMessageId = generateLocalId();
    const initialAiMessage: Message = {
      id: aiMessageId,
      content: '',
      isUser: false,
      timestamp: new Date(),
    };
    
    setMessages(prev => ({
      ...prev,
      [conversationToUse!]: [...(prev[conversationToUse!] || []), userMessage, initialAiMessage],
    }));
    setSendingMessage(true);

    eventSourceRef.current = sendMessageStream(
      content,
      {
        onMessage: (chunk) => {
          setMessages(prevMessages => {
            const currentConvMessages = prevMessages[conversationToUse!] || [];
            return {
              ...prevMessages,
              [conversationToUse!]: currentConvMessages.map((msg) =>
                msg.id === aiMessageId
                  ? { ...msg, content: msg.content + chunk }
                  : msg
              ),
            };
          });
        },
        onError: (error) => {
          console.error('SSE 接收错误:', error);
          setMessages(prevMessages => {
            const currentConvMessages = prevMessages[conversationToUse!] || [];
            return {
              ...prevMessages,
              [conversationToUse!]: currentConvMessages.map((msg) =>
                msg.id === aiMessageId
                  ? { ...msg, content: '抱歉，发生错误，请稍后再试。' }
                  : msg
              ),
            };
          });
          setSendingMessage(false);
          eventSourceRef.current = null;
        },
        onClose: () => {
          setSendingMessage(false);
          eventSourceRef.current = null;
          console.log('SSE 连接已关闭');
          if (userId) loadConversations(userId);
        }
      },
      conversationToUse
    );
  };

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [currentMessages]);

  return (
    <div className="flex h-screen bg-[rgb(var(--background-rgb))] text-[rgb(var(--foreground-rgb))]">
      <Head>
        <title>AI 聊天助手</title>
        <meta name="description" content="基于AI的智能聊天助手" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className={`fixed inset-y-0 left-0 z-40 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 md:flex md:flex-shrink-0 transition-transform duration-200 ease-in-out`}>
        {userId && (
          <ConversationSidebar
            conversations={conversations}
            currentConversationId={currentConversationId}
            onSelectConversation={handleSelectConversation}
            onCreateConversation={handleCreateConversation}
            onDeleteConversation={handleDeleteConversation}
            userId={userId}
            isLoading={isLoadingConversations || isProcessingConversation}
          />
        )}
      </div>
      
      <div className="flex flex-col flex-1 min-w-0 h-screen">
        <header className="bg-transparent py-2.5 px-4 sticky top-0 z-30 border-b border-[rgb(var(--border-color))] dark:border-[rgb(var(--neutral-800))] md:border-b-0">
          <div className="max-w-3xl mx-auto w-full flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="md:hidden p-2 mr-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              >
                {isSidebarOpen ? <XMarkIcon className="h-6 w-6" /> : <Bars3Icon className="h-6 w-6" />}
              </button>
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white truncate">
                {currentConversationId ? conversations.find(c => c.conversationId === currentConversationId)?.title : 'Chat'}
              </h2>
            </div>
            <div className="flex items-center space-x-3">
              <ThemeToggle />
              <button
                onClick={handleLogout}
                title="登出"
                className="p-2 text-gray-600 dark:text-gray-300 hover:text-red-500 dark:hover:text-red-400"
              >
                <ArrowRightOnRectangleIcon className="h-6 w-6" />
              </button>
            </div>
          </div>
        </header>

        <main className={`flex-1 flex flex-col pt-2 sm:pt-4 max-w-3xl mx-auto w-full min-h-0 ${currentMessages.length > 0 || currentConversationId ? 'pb-24 sm:pb-28' : 'pb-4'}`}>
          <div
            ref={chatContainerRef}
            className={`py-6 px-2 sm:px-4 chat-container flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-rounded scrollbar-thumb-[rgb(var(--scrollbar-thumb))] ${currentMessages.length === 0 && !currentConversationId ? 'flex flex-col justify-center' : ''}`}
          >
            {currentMessages.length === 0 && !sendingMessage && (
              <div className="p-6 flex flex-col items-center text-center">
                 {!currentConversationId && !isLoadingConversations ? (
                    <>
                        <h2 className="text-3xl font-semibold text-[rgb(var(--foreground-rgb))] mb-12 opacity-90">
                            有什么可以帮忙的？
                        </h2>
                        <div className="w-full max-w-md">
                            <ChatInput onSendMessage={handleSendMessage} disabled={sendingMessage || isProcessingConversation} />
                        </div>
                    </>
                 ) : currentConversationId && conversations.find(c=>c.conversationId === currentConversationId) ? (
                    <p className="text-lg text-[rgb(var(--muted-foreground-rgb))] opacity-80">
                      开始与 "{conversations.find(c=>c.conversationId === currentConversationId)?.title || '助手'}" 对话。
                    </p>
                 ) : isLoadingConversations || isProcessingConversation ? (
                    <p className="text-lg text-[rgb(var(--muted-foreground-rgb))] opacity-80">正在加载会话...</p>
                 ) : (
                    <p className="text-lg text-[rgb(var(--muted-foreground-rgb))] opacity-80">选择一个会话或新建一个会话开始聊天。</p>
                 )
                }
              </div>
            )}
            {currentMessages.length > 0 && (
              <div className="space-y-1">
                {currentMessages.map((message) => (
                  <ChatMessage key={message.id} message={message} />
                ))}
              </div>
            )}
            {sendingMessage && currentMessages.some(m => m.id === (currentMessages.find(msg => !msg.isUser && msg.content === '')?.id)) && (
              <div className="pl-3 mt-2 self-start">
                <div className="typing-indicator">
                  <div className="w-2 h-2 bg-[rgb(var(--primary-600))] rounded-full animate-pulse"></div>
                  <div className="w-2 h-2 bg-[rgb(var(--primary-600))] rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-[rgb(var(--primary-600))] rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            )}
          </div>
        </main>

        {currentConversationId && (
          <div className="fixed bottom-0 left-0 right-0 w-full bg-gradient-to-t from-[rgb(var(--background-rgb))] via-[rgb(var(--background-rgb))] to-transparent pt-6 pb-4 sm:pb-6 z-20 md:pl-72">
            <div className="max-w-3xl mx-auto px-2 sm:px-4">
              <ChatInput onSendMessage={handleSendMessage} disabled={sendingMessage || isProcessingConversation || !currentConversationId} />
            </div>
          </div>
        )}
        {!currentConversationId && currentMessages.length === 0 && !isLoadingConversations && !isProcessingConversation && (
           <div className="fixed bottom-0 left-0 right-0 w-full bg-gradient-to-t from-[rgb(var(--background-rgb))] via-[rgb(var(--background-rgb))] to-transparent pt-6 pb-4 sm:pb-6 z-20 md:pl-72">
            <div className="max-w-3xl mx-auto px-2 sm:px-4">
                 <ChatInput onSendMessage={handleSendMessage} disabled={sendingMessage || isProcessingConversation} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}