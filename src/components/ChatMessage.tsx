import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import { cn } from '@/utils/cn';

// 为 ReactMarkdown 组件的 code 渲染器定义类型
type CodeProps = {
  node?: any;
  inline?: boolean;
  className?: string;
  children?: React.ReactNode;
  [key: string]: any;
};

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

interface ChatMessageProps {
  message: Message;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  // 格式化时间
  const formattedTime = new Intl.DateTimeFormat('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(message.timestamp);

  return (
    <div
      className={cn(
        'flex w-full mb-4',
        // 用户消息靠右，AI 消息靠左但移除 items-end
        message.isUser ? 'justify-end items-end pr-3' : 'justify-start pl-3'
      )}
    >
      {/* 移除 AI 头像 */}
      {/* {!message.isUser && (
        // 使用 CSS 变量设置 AI 头像背景和文字颜色
        <div className="w-8 h-8 rounded-full bg-[rgba(var(--primary-600),0.1)] flex items-center justify-center mr-2 flex-shrink-0">
          <span className="text-[rgb(var(--primary-600))] text-sm font-medium">AI</span>
        </div>
      )} */}
      
      {/* 调整消息容器样式 */}
      <div
        className={cn(
          // 用户消息保留气泡样式，AI 消息移除气泡样式并调整 padding
          message.isUser
            ? 'px-4 py-3 max-w-[90%] md:max-w-[85%] lg:max-w-[75%] message-user'
            : 'py-3 w-full' // AI 消息移除 px-4, max-w, message-ai
        )}
      >
        {/* 使用 CSS 变量设置消息内容颜色 */}
        <div className="whitespace-pre-wrap break-words text-[15px] leading-relaxed text-[rgb(var(--foreground-rgb))] dark:text-[rgb(255,255,255)] ">
          {message.content ? (
            message.isUser ? (
              message.content
            ) : (
              // 使用 CSS 变量设置 Markdown 样式
              <div className="prose prose-neutral dark:prose-invert max-w-none text-[rgb(var(--foreground-rgb))]">
                <ReactMarkdown
                  // @ts-ignore - 忽略类型不兼容问题
                  remarkPlugins={[remarkGfm]}
                  components={{
                    // 保留代码块的高亮逻辑
                    code: ({ node, inline, className, children, ...props }: CodeProps) => {
                      const match = /language-(\w+)/.exec(className || '');
                      return !inline && match ? (
                        <SyntaxHighlighter
                          style={oneDark} // 保持代码高亮样式
                          language={match[1]}
                          PreTag="div"
                          customStyle={{ background: 'rgb(var(--neutral-700))', borderRadius: '0.5rem', padding: '0.8rem' }} // 使用变量设置背景
                          codeTagProps={{ style: { color: 'rgb(255,255,255)' } }} // 使用纯白色提高代码可读性
                          {...props}
                        >
                          {String(children).replace(/\n$/, '')}
                        </SyntaxHighlighter>
                      ) : (
                        <code className={className} {...props}>
                          {children}
                        </code>
                      );
                    }
                  }}
                >
                  {message.content}
                </ReactMarkdown>
              </div>
            )
          ) : (
            // 使用 CSS 变量设置加载提示颜色
            <span className="text-[rgb(var(--foreground-rgb))] italic">正在思考...</span>
          )}
        </div>
        
      </div>
      
      {/* 移除用户头像 */}
      {/* {message.isUser && (
        // 使用 CSS 变量设置用户头像背景和文字颜色
        <div className="w-8 h-8 rounded-full bg-[rgb(var(--primary-600))] flex items-center justify-center ml-2 flex-shrink-0">
          <span className="text-white text-sm font-medium">我</span>
        </div>
      )} */}
    </div>
  );
};

export default ChatMessage;