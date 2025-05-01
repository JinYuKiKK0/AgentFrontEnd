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
    <div className="w-full">
      <div className="relative">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="输入消息..."
          disabled={disabled}
          className="w-full resize-none overflow-hidden outline-none py-3 px-4 max-h-[200px] pr-14 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-[#343541] text-neutral-900 dark:text-neutral-100 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 dark:focus:ring-primary-900 transition-all text-[15px] placeholder:text-neutral-400 dark:placeholder:text-neutral-500"
          rows={1}
          aria-label="聊天输入框"
        />
        <button
          onClick={handleSendMessage}
          disabled={!input.trim() || disabled}
          className="send-button absolute right-3 bottom-3"
          aria-label="发送消息"
        >
          <PaperAirplaneIcon className="h-5 w-5" />
        </button>
      </div>
      <div className="flex items-center justify-between mt-2 px-1">
        <div className="text-xs text-neutral-500 dark:text-neutral-400">
          按 <kbd className="px-1.5 py-0.5 bg-neutral-100 dark:bg-[#40414f] rounded text-neutral-600 dark:text-neutral-300 font-sans">Enter</kbd> 发送，<kbd className="px-1.5 py-0.5 bg-neutral-100 dark:bg-[#40414f] rounded text-neutral-600 dark:text-neutral-300 font-sans">Shift + Enter</kbd> 换行
        </div>
        {disabled && (
          <div className="text-xs text-primary-600 dark:text-primary-400 animate-pulse-slow">
            AI正在回复中...
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatInput;