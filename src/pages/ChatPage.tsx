import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  IconButton,
  Collapse,
} from '@mui/material';
import {
  Send as SendIcon,
  Stop as StopIcon,
  Menu as MenuIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { useChatSessions } from '../features/chat/hooks/useChatSessions';
import { useSSEChat } from '../features/chat/hooks/useSSEChat';
import { ChatMessage } from '../types/api';
import MessageBubble from '../features/chat/components/MessageBubble';
import SessionList from '../features/chat/components/SessionList';

// 临时用户ID，实际项目中应该从认证系统获取
// const TEMP_USER_ID = 'user-123'; // This line is commented out or removed

const ChatPage: React.FC = () => {
  const [inputMessage, setInputMessage] = useState('');
  const [selectedSessionId, setSelectedSessionId] = useState<string>('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [hasStartedChat, setHasStartedChat] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const initialLoadRef = useRef(false);

  // 使用自定义Hooks
  const {
    sessions,
    loading: sessionsLoading,
    error: sessionsError,
    createSession,
    deleteSession,
    loadSessions,
  } = useChatSessions(); // Ensure this call has no arguments

  const {
    messages,
    currentMessage,
    isStreaming,
    error: chatError,
    sendMessage,
    stopStreaming,
    loadMessages,
  } = useSSEChat();

  // 检查是否已经开始聊天
  useEffect(() => {
    if (messages.length > 0 || selectedSessionId) {
      setHasStartedChat(true);
    }
  }, [messages, selectedSessionId]);

  // 自动滚动到底部
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // 当消息更新时滚动到底部
  useEffect(() => {
    scrollToBottom();
  }, [messages, currentMessage]);

  // 初始化加载会话列表 - 只执行一次
  useEffect(() => {
    if (!initialLoadRef.current) {
      initialLoadRef.current = true;
      loadSessions();
    }
  }, [loadSessions]);

  // 处理创建新会话
  const handleCreateSession = async () => {
    try {
      const newSessionId = await createSession('新对话');
      if (newSessionId) {
        setSelectedSessionId(newSessionId);
        loadMessages(newSessionId);
        // 创建新会话时回到开始页面布局
        setHasStartedChat(false);
      }
    } catch (error) {
      console.error('创建会话失败:', error);
    }
  };

  // 处理选择会话
  const handleSelectSession = (sessionId: string) => {
    setSelectedSessionId(sessionId);
    loadMessages(sessionId);
    setHasStartedChat(true);
  };

  // 处理删除会话
  const handleDeleteSession = async (sessionId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    try {
      await deleteSession(sessionId);
      if (selectedSessionId === sessionId) {
        setSelectedSessionId('');
        // 如果删除的是当前会话且没有其他会话，重置为初始状态
        if (sessions.length <= 1) {
          setHasStartedChat(false);
        }
      }
    } catch (error) {
      console.error('删除会话失败:', error);
    }
  };

  // 处理发送消息
  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isStreaming) {
      return;
    }

    // 如果没有选中会话，先创建一个
    let sessionId = selectedSessionId;
    if (!sessionId) {
      try {
        const newSessionId = await createSession('新对话');
        if (newSessionId) {
          sessionId = newSessionId;
          setSelectedSessionId(newSessionId);
          setHasStartedChat(true);
        } else {
          return;
        }
      } catch (error) {
        console.error('创建会话失败:', error);
        return;
      }
    }

    try {
      await sendMessage(inputMessage, sessionId);
      setInputMessage('');
      setHasStartedChat(true);
    } catch (error) {
      console.error('发送消息失败:', error);
    }
  };

  // 处理键盘事件
  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  // 渲染消息列表
  const renderMessages = () => {
    const allMessages = [...messages];
    
    // 如果正在流式传输，添加当前消息
    if (isStreaming && currentMessage) {
      allMessages.push({
        id: 'streaming',
        role: 'assistant',
        content: currentMessage,
        timestamp: new Date().toISOString(),
        conversationId: selectedSessionId,
      } as ChatMessage);
    }

    return allMessages.map((message) => (
      <MessageBubble
        key={message.id}
        message={message}
        isStreaming={message.id === 'streaming'}
      />
    ));
  };

  // 渲染输入框组件
  const renderInputBox = (centered = false) => (
    <Box 
      sx={{ 
        maxWidth: centered ? 600 : 800,
        mx: 'auto',
        display: 'flex', 
        gap: 2, 
        alignItems: 'flex-end',
        width: '100%',
      }}
    >
      <TextField
        fullWidth
        multiline
        maxRows={4}
        placeholder="输入消息开始对话..."
        value={inputMessage}
        onChange={(e) => setInputMessage(e.target.value)}
        onKeyPress={handleKeyPress}
        disabled={isStreaming}
        variant="outlined"
        sx={{
          '& .MuiOutlinedInput-root': {
            borderRadius: centered ? 4 : 3,
            bgcolor: 'background.paper',
            fontSize: centered ? '1.1rem' : '1rem',
            minHeight: centered ? 64 : 56,
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: 'primary.main',
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderWidth: 2,
            },
          },
        }}
      />
      {isStreaming ? (
        <Button
          variant="contained"
          color="error"
          onClick={stopStreaming}
          startIcon={<StopIcon />}
          sx={{ 
            minWidth: 100,
            height: centered ? 64 : 56,
            borderRadius: centered ? 4 : 3,
            textTransform: 'none',
            fontWeight: 500,
          }}
        >
          停止
        </Button>
      ) : (
        <Button
          variant="contained"
          onClick={handleSendMessage}
          disabled={!inputMessage.trim()}
          startIcon={<SendIcon />}
          sx={{ 
            minWidth: 100,
            height: centered ? 64 : 56,
            borderRadius: centered ? 4 : 3,
            textTransform: 'none',
            fontWeight: 500,
          }}
        >
          发送
        </Button>
      )}
    </Box>
  );

  // 如果还没有开始聊天，显示居中的输入框
  if (!hasStartedChat) {
    return (
      <Box sx={{ height: '100%', display: 'flex', position: 'relative' }}>
        {/* 左侧可折叠会话列表 */}
        <Collapse 
          in={sidebarOpen} 
          orientation="horizontal"
          sx={{ 
            position: 'relative',
            zIndex: 1,
          }}
        >
          <Box 
            sx={{ 
              width: 320,
              height: '100%',
              borderRight: 1,
              borderColor: 'divider',
              bgcolor: 'background.paper',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <SessionList
              sessions={sessions}
              selectedSessionId={selectedSessionId}
              loading={sessionsLoading}
              error={sessionsError}
              onCreateSession={handleCreateSession}
              onSelectSession={handleSelectSession}
              onDeleteSession={handleDeleteSession}
            />
          </Box>
        </Collapse>

        {/* 主区域 - 居中的输入框 */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative' }}>
          {/* 顶部工具栏 */}
          <Box 
            sx={{ 
              display: 'flex',
              alignItems: 'center',
              p: 2,
              borderBottom: 1,
              borderColor: 'divider',
              bgcolor: 'background.paper',
            }}
          >
            <IconButton 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              sx={{ 
                color: 'text.secondary',
                '&:hover': {
                  bgcolor: 'action.hover',
                },
              }}
            >
              {sidebarOpen ? <CloseIcon /> : <MenuIcon />}
            </IconButton>
          </Box>

          {/* 居中的欢迎界面和输入框 */}
          <Box
            sx={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              p: 6,
              bgcolor: 'background.default',
            }}
          >
            <Box sx={{ textAlign: 'center', mb: 6, maxWidth: 600 }}>
              <Typography variant="h3" gutterBottom sx={{ fontWeight: 300, mb: 3, color: 'text.primary' }}>
                开始对话
              </Typography>
              <Typography variant="body1" sx={{ color: 'text.secondary', mb: 4 }}>
                在下方输入框中输入消息开始对话
              </Typography>
            </Box>
            
            {/* 居中的输入框 */}
            {renderInputBox(true)}
          </Box>
        </Box>
      </Box>
    );
  }

  // 已经开始聊天，显示正常的聊天界面
  return (
    <Box sx={{ height: '100%', display: 'flex', position: 'relative' }}>
      {/* 左侧可折叠会话列表 */}
      <Collapse 
        in={sidebarOpen} 
        orientation="horizontal"
        sx={{ 
          position: 'relative',
          zIndex: 1,
        }}
      >
        <Box 
          sx={{ 
            width: 320,
            height: '100%',
            borderRight: 1,
            borderColor: 'divider',
            bgcolor: 'background.paper',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <SessionList
            sessions={sessions}
            selectedSessionId={selectedSessionId}
            loading={sessionsLoading}
            error={sessionsError}
            onCreateSession={handleCreateSession}
            onSelectSession={handleSelectSession}
            onDeleteSession={handleDeleteSession}
          />
        </Box>
      </Collapse>

      {/* 主聊天区域 */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative' }}>
        {/* 顶部工具栏 */}
        <Box 
          sx={{ 
            display: 'flex',
            alignItems: 'center',
            p: 2,
            borderBottom: 1,
            borderColor: 'divider',
            bgcolor: 'background.paper',
            gap: 2,
          }}
        >
          <IconButton 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            sx={{ 
              color: 'text.secondary',
              '&:hover': {
                bgcolor: 'action.hover',
              },
            }}
          >
            {sidebarOpen ? <CloseIcon /> : <MenuIcon />}
          </IconButton>
          
          {selectedSessionId && (
            <Typography variant="h6" sx={{ fontWeight: 500, flex: 1 }}>
              {sessions.find(s => s.conversationId === selectedSessionId)?.title || '对话'}
            </Typography>
          )}
        </Box>

        {/* 消息区域 */}
        <Box 
          sx={{ 
            flex: 1, 
            overflow: 'auto', 
            p: 3,
            bgcolor: 'grey.50',
          }}
        >
          {chatError && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {chatError}
            </Alert>
          )}
          
          {/* 消息列表 */}
          <Box sx={{ minHeight: '100%', display: 'flex', flexDirection: 'column' }}>
            {renderMessages()}
            <div ref={messagesEndRef} />
          </Box>
        </Box>

        {/* 底部输入区域 */}
        <Box 
          sx={{ 
            p: 3,
            borderTop: 1,
            borderColor: 'divider',
            bgcolor: 'background.paper',
          }}
        >
          {renderInputBox(false)}
        </Box>
      </Box>
    </Box>
  );
};

export default ChatPage; 