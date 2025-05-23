import React from 'react';
import { PlusIcon, TrashIcon, ChatBubbleLeftEllipsisIcon } from '@heroicons/react/24/outline';
import { ApiConversation } from '@/services/api'; // 确保路径正确

interface ConversationSidebarProps {
  conversations: ApiConversation[];
  currentConversationId: string | null;
  onSelectConversation: (conversationId: string) => void;
  onCreateConversation: () => Promise<void>; // 修改为 Promise<void> 以处理异步操作
  onDeleteConversation: (conversationId: string) => Promise<void>; // 修改为 Promise<void>
  userId: string;
  isLoading: boolean; // 添加加载状态，以便在创建或删除时禁用按钮
}

const ConversationSidebar: React.FC<ConversationSidebarProps> = ({
  conversations,
  currentConversationId,
  onSelectConversation,
  onCreateConversation,
  onDeleteConversation,
  userId,
  isLoading,
}) => {
  return (
    <div className="w-full md:w-72 bg-[rgb(var(--neutral-50))] dark:bg-[rgb(var(--neutral-900))] p-3 flex flex-col h-full border-r border-[rgb(var(--border-color))] dark:border-[rgb(var(--neutral-800))]">
      <button
        onClick={onCreateConversation}
        disabled={isLoading}
        className="w-full mb-3 flex items-center justify-center p-2.5 rounded-lg border border-[rgb(var(--input-border))] dark:border-[rgb(var(--neutral-700))] text-[rgb(var(--foreground-rgb))] dark:text-[rgb(var(--neutral-300))] hover:bg-[rgb(var(--neutral-100))] dark:hover:bg-[rgb(var(--neutral-800))] transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-1 focus:ring-[rgb(var(--primary-500))]"
      >
        <PlusIcon className="h-5 w-5 mr-2 flex-shrink-0" />
        <span className="text-sm font-medium">新建聊天</span>
      </button>
      <div className="flex-1 overflow-y-auto space-y-1 scrollbar-thin scrollbar-thumb-rounded scrollbar-thumb-[rgb(var(--scrollbar-thumb))] scrollbar-track-transparent pr-1">
        {conversations.length === 0 && !isLoading && (
          <p className="text-sm text-center text-[rgb(var(--muted-foreground-rgb))] mt-4">没有历史会话。</p>
        )}
        {conversations.map((conv) => (
          <div
            key={conv.conversationId}
            className={`group flex items-center justify-between p-2.5 rounded-lg cursor-pointer transition-colors min-w-0 ${ // min-w-0 for truncation
              conv.conversationId === currentConversationId
                ? 'bg-[rgb(var(--primary-100))] dark:bg-[rgb(var(--neutral-700))] text-[rgb(var(--primary-600))] dark:text-white'
                : 'hover:bg-[rgb(var(--neutral-100))] dark:hover:bg-[rgb(var(--neutral-800))] text-[rgb(var(--foreground-rgb))] dark:text-[rgb(var(--neutral-300))]'
            }`}
            onClick={() => !isLoading && onSelectConversation(conv.conversationId)}
            title={conv.title || '未命名对话'}
          >
            <ChatBubbleLeftEllipsisIcon className="h-5 w-5 mr-2.5 flex-shrink-0 opacity-70" />
            <span className="truncate text-sm font-medium flex-1">
              {conv.title || '未命名对话'}
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (!isLoading) {
                  onDeleteConversation(conv.conversationId);
                }
              }}
              disabled={isLoading}
              className="p-1 opacity-0 group-hover:opacity-100 text-[rgb(var(--muted-foreground-rgb))] hover:text-[rgb(var(--foreground-rgb))] dark:hover:text-white transition-opacity focus:outline-none disabled:opacity-30"
              aria-label="删除会话"
            >
              <TrashIcon className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
      <div className="mt-auto pt-3 border-t border-[rgb(var(--border-color))] dark:border-[rgb(var(--neutral-800))]">
        <p className="text-xs text-[rgb(var(--muted-foreground-rgb))] truncate">用户 ID: {userId}</p>
      </div>
    </div>
  );
};

export default ConversationSidebar; 