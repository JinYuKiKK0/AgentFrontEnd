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
        'flex w-full items-end mb-4',
        message.isUser ? 'justify-end pr-3' : 'justify-start pl-3'
      )}
    >
      {!message.isUser && (
        <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center mr-2 flex-shrink-0">
          <span className="text-primary-700 dark:text-primary-400 text-sm font-medium">AI</span>
        </div>
      )}
      
      <div
        className={cn(
          'px-4 py-3 max-w-[90%] md:max-w-[85%] lg:max-w-[75%]',
          message.isUser
            ? 'message-user'
            : 'message-ai'
        )}
      >
        <div className="whitespace-pre-wrap break-words text-[15px] leading-relaxed">
          {message.content ? (
            message.isUser ? (
              message.content
            ) : (
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <ReactMarkdown
                  // @ts-ignore - 忽略类型不兼容问题
                  remarkPlugins={[remarkGfm]}
                  components={{
                    code: ({ node, inline, className, children, ...props }: CodeProps) => {
                      const match = /language-(\w+)/.exec(className || '');
                      return !inline && match ? (
                        <SyntaxHighlighter
                          style={oneDark}
                          language={match[1]}
                          PreTag="div"
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
            <span className="text-neutral-400 dark:text-neutral-500 italic">正在思考...</span>
          )}
        </div>
        <div
          className={cn(
            'text-xs mt-1.5 flex justify-end',
            message.isUser ? 'text-primary-100' : 'text-neutral-400 dark:text-neutral-500'
          )}
        >
          {formattedTime}
        </div>
      </div>
      
      {message.isUser && (
        <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center ml-2 flex-shrink-0">
          <span className="text-white text-sm font-medium">我</span>
        </div>
      )}
    </div>
  );
};

export default ChatMessage;