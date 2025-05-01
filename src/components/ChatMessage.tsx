import React from 'react';
import { Message } from '@/pages/index';
import { cn } from '@/utils/cn';

/**
 * 聊天消息组件属性
 */
interface ChatMessageProps {
  message: Message;
}

/**
 * 聊天消息组件 - 显示单条聊天消息
 * @param message 消息对象
 */
const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  // 格式化时间
  const formattedTime = new Intl.DateTimeFormat('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(message.timestamp);

  return (
    <div
      className={cn(
        'flex w-full max-w-4xl',
        message.isUser ? 'justify-end pr-4' : 'justify-start'
      )}
    >
      <div
        className={cn(
          'rounded-lg px-4 py-2 max-w-[80%]',
          message.isUser
            ? 'bg-primary-600 text-white rounded-tr-none'
            : 'bg-white text-gray-800 border border-gray-200 rounded-tl-none shadow-sm'
        )}
      >
        <div className="whitespace-pre-wrap break-words">{message.content}</div>
        <div
          className={cn(
            'text-xs mt-1',
            message.isUser ? 'text-primary-100' : 'text-gray-400'
          )}
        >
          {formattedTime}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;