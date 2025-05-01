import React, { useState, useRef, useEffect } from 'react';
import { PaperAirplaneIcon } from '@heroicons/react/24/solid';

/**
 * 聊天输入组件属性
 */
interface ChatInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
}

/**
 * 聊天输入组件 - 用户输入消息的界面
 * @param onSendMessage 发送消息的回调函数
 * @param disabled 是否禁用输入
 */
const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, disabled = false }) => {
  // 输入内容状态
  const [input, setInput] = useState('');
  // 文本区域引用
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 处理输入变化
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
  };

  // 处理消息发送
  const handleSendMessage = () => {
    if (input.trim() && !disabled) {
      onSendMessage(input);
      setInput('');
      
      // 重置文本区域高度
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  // 处理按键事件
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // 按下Enter键发送消息，按下Shift+Enter换行
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // 自动调整文本区域高度
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        200
      )}px`;
    }
  }, [input]);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
      <div className="relative">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="输入消息..."
          disabled={disabled}
          className="w-full resize-none overflow-hidden outline-none py-2 px-3 max-h-[200px] pr-12 rounded-md border border-gray-300 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all"
          rows={1}
          aria-label="聊天输入框"
        />
        <button
          onClick={handleSendMessage}
          disabled={!input.trim() || disabled}
          className="absolute right-2 bottom-2 p-2 rounded-full bg-primary-600 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary-700 transition-colors"
          aria-label="发送消息"
        >
          <PaperAirplaneIcon className="h-5 w-5" />
        </button>
      </div>
      <div className="text-xs text-gray-500 mt-2 px-2">
        按 Enter 发送，Shift + Enter 换行
      </div>
    </div>
  );
};

export default ChatInput;