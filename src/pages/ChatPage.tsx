import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
} from '@mui/material';
import {
  Send as SendIcon,
  Add as AddIcon,
  Stop as StopIcon,
} from '@mui/icons-material';
import { useChatSessions } from '../features/chat/hooks/useChatSessions';
import { useSSEChat } from '../features/chat/hooks/useSSEChat';
import { ChatMessage } from '../types/api';
import MessageBubble from '../features/chat/components/MessageBubble';
import SessionList from '../features/chat/components/SessionList';

// 临时用户ID，实际项目中应该从认证系统获取
const TEMP_USER_ID = 'user-123';

const ChatPage: React.FC = () => {
  const [inputMessage, setInputMessage] = useState('');
  const [selectedSessionId, setSelectedSessionId] = useState<string>('');
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
  } = useChatSessions(TEMP_USER_ID);

  const {
    messages,
    currentMessage,
    isStreaming,
    error: chatError,
    sendMessage,
    stopStreaming,
    loadMessages,
  } = useSSEChat();

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
  }, []); // 空依赖数组，只在组件挂载时执行一次

  // 处理创建新会话
  const handleCreateSession = async () => {
    try {
      const newSessionId = await createSession('新对话');
      if (newSessionId) {
        setSelectedSessionId(newSessionId);
        loadMessages(newSessionId);
      }
    } catch (error) {
      console.error('创建会话失败:', error);
    }
  };

  // 处理选择会话
  const handleSelectSession = (sessionId: string) => {
    setSelectedSessionId(sessionId);
    loadMessages(sessionId);
  };

  // 处理删除会话
  const handleDeleteSession = async (sessionId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    try {
      await deleteSession(sessionId);
      if (selectedSessionId === sessionId) {
        setSelectedSessionId('');
      }
    } catch (error) {
      console.error('删除会话失败:', error);
    }
  };

  // 处理发送消息
  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !selectedSessionId || isStreaming) {
      return;
    }

    try {
      await sendMessage(inputMessage, selectedSessionId);
      setInputMessage('');
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

  return (
    <Container maxWidth="xl" sx={{ height: '100%', py: 2 }}>
      <Grid container spacing={2} sx={{ height: '100%' }}>
        {/* 左侧会话列表 */}
        <Grid item xs={12} md={3}>
          <SessionList
            sessions={sessions}
            selectedSessionId={selectedSessionId}
            loading={sessionsLoading}
            error={sessionsError}
            onCreateSession={handleCreateSession}
            onSelectSession={handleSelectSession}
            onDeleteSession={handleDeleteSession}
          />
        </Grid>

        {/* 右侧聊天区域 */}
        <Grid item xs={12} md={9}>
          <Paper elevation={2} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            {selectedSessionId ? (
              <>
                {/* 聊天头部 */}
                <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
                  <Typography variant="h6">
                    {sessions.find(s => s.conversationId === selectedSessionId)?.title || '对话'}
                  </Typography>
                </Box>

                {/* 消息区域 */}
                <Box 
                  sx={{ 
                    flex: 1, 
                    overflow: 'auto', 
                    p: 2,
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  {chatError && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                      {chatError}
                    </Alert>
                  )}
                  
                  {/* 消息列表 */}
                  <Box sx={{ flex: 1 }}>
                    {renderMessages()}
                    <div ref={messagesEndRef} />
                  </Box>
                </Box>

                {/* 输入区域 */}
                <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-end' }}>
                    <TextField
                      fullWidth
                      multiline
                      maxRows={4}
                      placeholder="输入消息... (Shift+Enter 换行，Enter 发送)"
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      disabled={isStreaming}
                      variant="outlined"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
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
                          height: 56,
                          borderRadius: 2,
                        }}
                      >
                        停止
                      </Button>
                    ) : (
                      <Button
                        variant="contained"
                        onClick={handleSendMessage}
                        disabled={!inputMessage.trim() || !selectedSessionId}
                        startIcon={<SendIcon />}
                        sx={{ 
                          minWidth: 100,
                          height: 56,
                          borderRadius: 2,
                        }}
                      >
                        发送
                      </Button>
                    )}
                  </Box>
                </Box>
              </>
            ) : (
              // 未选择会话时的占位内容
              <Box
                sx={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  textAlign: 'center',
                  p: 4,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                {/* 背景装饰 */}
                <Box
                  sx={{
                    position: 'absolute',
                    top: -50,
                    right: -50,
                    width: 200,
                    height: 200,
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,0.1)',
                  }}
                />
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: -30,
                    left: -30,
                    width: 150,
                    height: 150,
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,0.05)',
                  }}
                />
                
                <Typography variant="h4" gutterBottom sx={{ fontWeight: 300, mb: 2 }}>
                  欢迎使用 AI 助手
                </Typography>
                <Typography variant="h6" sx={{ mb: 3, opacity: 0.9 }}>
                  智能对话，随时为您服务
                </Typography>
                <Typography variant="body1" sx={{ mb: 4, opacity: 0.8, maxWidth: 400 }}>
                  请选择一个对话或创建新对话开始聊天。我们的AI助手将为您提供智能、准确的回答。
                </Typography>
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<AddIcon />}
                  onClick={handleCreateSession}
                  sx={{
                    bgcolor: 'rgba(255,255,255,0.2)',
                    color: 'white',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.3)',
                    '&:hover': {
                      bgcolor: 'rgba(255,255,255,0.3)',
                    },
                    px: 4,
                    py: 1.5,
                    borderRadius: 3,
                  }}
                >
                  开始新对话
                </Button>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default ChatPage; 