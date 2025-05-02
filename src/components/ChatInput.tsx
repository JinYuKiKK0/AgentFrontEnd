import React, { useState, useRef, useEffect } from 'react';
// 导入 ArrowUpIcon
import { ArrowUpIcon } from '@heroicons/react/24/solid';

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
      {/* 调整输入框容器样式 - 明确指定 border-solid 和 border-1 (隐式) */}
      <div className="relative flex items-end p-1.5 rounded-2xl border border-solid border-[rgb(var(--input-border))] bg-[rgb(var(--input-bg))] focus-within:outline-none focus-within:ring-0 focus-within:border-[rgb(var(--input-border))] focus-within:shadow-none focus-within:border-solid">
        <textarea
          ref={textareaRef}
          // 合并后的 className，移除了重复的属性
          className="w-full flex-1 resize-none border-0 bg-transparent py-2.5 px-3 pr-10 text-[rgb(var(--foreground-rgb))] placeholder:text-[rgb(var(--muted-foreground-rgb))] focus:outline-none focus:ring-0 focus:border-0 focus:shadow-none disabled:cursor-not-allowed disabled:opacity-50 overflow-y-auto max-h-[200px] scrollbar-thin scrollbar-thumb-rounded scrollbar-thumb-[rgb(var(--primary-500))] scrollbar-track-[rgb(var(--background-rgb))] text-[15px] transition-none"
          placeholder="询问任何疑惑..." // 修正后的 placeholder
          value={input}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          // 移除重复的 className 属性
          rows={2} // 将默认行数改为 2
          aria-label="聊天输入框"
        />
        {/* 条件渲染发送按钮，仅当输入框有内容时显示 */}
        {input.trim() && (
          <button
            onClick={handleSendMessage}
            disabled={disabled} // 禁用状态由外部 props 控制
            // 更新按钮样式：圆形、向上箭头图标、颜色、定位
            className="ml-2 flex-shrink-0 self-end mb-0.5 w-8 h-8 rounded-full bg-black text-white dark:bg-white dark:text-black flex items-center justify-center hover:bg-opacity-80 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
            aria-label="发送消息"
          >
            {/* 使用 ArrowUpIcon，并增大尺寸使其看起来更粗 */}
            <ArrowUpIcon className="h-6 w-6" />
          </button>
        )}
      </div>
      {/* 移除底部提示文字 */}
      {/* <div className="flex items-center justify-between mt-2 px-1">
        <div className="text-xs text-[rgba(var(--foreground-rgb),0.6)]">
          按 <kbd className="px-1.5 py-0.5 bg-[rgba(var(--foreground-rgb),0.05)] rounded text-[rgba(var(--foreground-rgb),0.8)] font-sans border border-[rgba(var(--border-color),0.5)]">Enter</kbd> 发送，<kbd className="px-1.5 py-0.5 bg-[rgba(var(--foreground-rgb),0.05)] rounded text-[rgba(var(--foreground-rgb),0.8)] font-sans border border-[rgba(var(--border-color),0.5)]">Shift + Enter</kbd> 换行
        </div>
        {disabled && (
          <div className="text-xs text-[rgb(var(--primary-600))] animate-pulse-slow">
            AI正在回复中...
          </div>
        )}
      </div> */}
    </div>
  );
};

export default ChatInput;