import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  IconButton,
  Collapse,
  CircularProgress,
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
  const chatMessagesContainerRef = useRef<HTMLDivElement>(null);
  const initialSessionLoadRef = useRef(false);

  const {
    sessions,
    loading: sessionsLoading,
    error: sessionsError,
    createSession,
    deleteSession,
    loadSessions,
  } = useChatSessions();

  const {
    messages,
    currentMessage,
    isStreaming,
    sseError,
    sendMessage,
    stopStreaming,
    clearChatState,
    isLoadingHistory,
    historyError,
    hasMoreHistory,
    loadInitialChatMessages,
    loadMoreChatHistory,
  } = useSSEChat();

  useEffect(() => {
    if (!initialSessionLoadRef.current) {
      initialSessionLoadRef.current = true;
      loadSessions();
    }
  }, [loadSessions]);
  
  useEffect(() => {
    if (selectedSessionId) {
      setHasStartedChat(true);
      loadInitialChatMessages(selectedSessionId);
    } else {
      clearChatState();
      setHasStartedChat(false);
    }
  }, [selectedSessionId, loadInitialChatMessages, clearChatState]);

  useEffect(() => {
    if (!isLoadingHistory) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, currentMessage, isLoadingHistory]);

  const handleCreateSession = async () => {
    try {
      const newSessionId = await createSession('新对话');
      if (newSessionId) {
        setSelectedSessionId(newSessionId);
      }
    } catch (error) {
      console.error('创建会话失败:', error);
    }
  };

  const handleSelectSession = (sessionId: string) => {
    if (sessionId === selectedSessionId) return;
    setSelectedSessionId(sessionId);
  };

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

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isStreaming) return;
    let currentSessionToUse = selectedSessionId;

    if (!currentSessionToUse) {
      try {
        const newSessionId = await createSession('新对话');
        if (newSessionId) {
          currentSessionToUse = newSessionId;
          setSelectedSessionId(newSessionId);
        } else {
          return;
        }
      } catch (error) {
        console.error('发送前创建会话失败:', error);
        return;
      }
    }
    if (currentSessionToUse) {
        await sendMessage(inputMessage, currentSessionToUse);
        setInputMessage('');
    } else {
        console.error("No active session to send message to.");
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  const renderMessages = () => {
    const allMessagesToRender = [...messages];
    if (isStreaming && currentMessage) {
      allMessagesToRender.push({
        id: 'streaming-assistant-message',
        role: 'assistant',
        content: currentMessage,
        timestamp: new Date().toISOString(),
        conversationId: selectedSessionId,
      });
    }
    return allMessagesToRender.map((message) => (
      <MessageBubble
        key={message.id}
        message={message}
        isStreaming={message.id === 'streaming-assistant-message' && isStreaming}
      />
    ));
  };
  
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
        disabled={isStreaming || (!selectedSessionId && isLoadingHistory)}
        variant="outlined"
        sx={{
          '& .MuiOutlinedInput-root': {
            borderRadius: centered ? 4 : 3,
            bgcolor: 'background.paper',
            fontSize: centered ? '1.1rem' : '1rem',
            minHeight: centered ? 64 : 56,
            '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'primary.main' },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderWidth: 2 },
          },
        }}
      />
      {isStreaming ? (
        <Button variant="contained" color="error" onClick={stopStreaming} startIcon={<StopIcon />} sx={{ minWidth: 100, height: centered ? 64 : 56, borderRadius: centered ? 4 : 3, textTransform: 'none', fontWeight: 500 }}>停止</Button>
      ) : (
        <Button variant="contained" onClick={handleSendMessage} disabled={!inputMessage.trim()} startIcon={<SendIcon />} sx={{ minWidth: 100, height: centered ? 64 : 56, borderRadius: centered ? 4 : 3, textTransform: 'none', fontWeight: 500 }}>发送</Button>
      )}
    </Box>
  );

  if (!selectedSessionId && !hasStartedChat) {
    return (
      <Box sx={{ height: '100%', display: 'flex', position: 'relative' }}>
        <Collapse in={sidebarOpen} orientation="horizontal" sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{ width: 320, height: '100%', borderRight: 1, borderColor: 'divider', bgcolor: 'background.paper', display: 'flex', flexDirection: 'column' }}>
            <SessionList sessions={sessions} selectedSessionId={selectedSessionId} loading={sessionsLoading} error={sessionsError} onCreateSession={handleCreateSession} onSelectSession={handleSelectSession} onDeleteSession={handleDeleteSession} />
          </Box>
        </Collapse>
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', p: 2, borderBottom: 1, borderColor: 'divider', bgcolor: 'background.paper' }}>
            <IconButton onClick={() => setSidebarOpen(!sidebarOpen)} sx={{ color: 'text.secondary', '&:hover': { bgcolor: 'action.hover' } }}>
              {sidebarOpen ? <CloseIcon /> : <MenuIcon />}
            </IconButton>
          </Box>
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', p: 6, bgcolor: 'background.default' }}>
            <Box sx={{ textAlign: 'center', mb: 6, maxWidth: 600 }}>
              <Typography variant="h3" gutterBottom sx={{ fontWeight: 300, mb: 3, color: 'text.primary' }}>开始对话</Typography>
              <Typography variant="body1" sx={{ color: 'text.secondary', mb: 4 }}>在下方输入框中输入消息开始对话</Typography>
            </Box>
            {renderInputBox(true)}
          </Box>
        </Box>
      </Box>
    );
  }
  
  return (
    <Box sx={{ height: '100%', display: 'flex', position: 'relative' }}>
      <Collapse in={sidebarOpen} orientation="horizontal" sx={{ position: 'relative', zIndex: 1 }}>
        <Box sx={{ width: 320, height: '100%', borderRight: 1, borderColor: 'divider', bgcolor: 'background.paper', display: 'flex', flexDirection: 'column' }}>
          <SessionList sessions={sessions} selectedSessionId={selectedSessionId} loading={sessionsLoading} error={sessionsError} onCreateSession={handleCreateSession} onSelectSession={handleSelectSession} onDeleteSession={handleDeleteSession} />
        </Box>
      </Collapse>
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', p: 2, borderBottom: 1, borderColor: 'divider', bgcolor: 'background.paper', gap: 2 }}>
          <IconButton onClick={() => setSidebarOpen(!sidebarOpen)} sx={{ color: 'text.secondary', '&:hover': { bgcolor: 'action.hover' } }}>
            {sidebarOpen ? <CloseIcon /> : <MenuIcon />}
          </IconButton>
          {selectedSessionId && (
            <Typography variant="h6" sx={{ fontWeight: 500, flex: 1 }}>
              {sessions.find(s => s.conversationId === selectedSessionId)?.title || '对话'}
            </Typography>
          )}
        </Box>

        <Box ref={chatMessagesContainerRef} sx={{ flex: 1, overflow: 'auto', p: 3, bgcolor: 'grey.50' }}>
          {isLoadingHistory && messages.length === 0 && !historyError && (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
              <CircularProgress />
            </Box>
          )}
          {historyError && (
            <Alert severity="error" sx={{ mb: 2 }}>{`历史记录错误: ${historyError}`}</Alert>
          )}
          {sseError && (
            <Alert severity="error" sx={{ mb: 2 }}>{`消息错误: ${sseError}`}</Alert>
          )}
          
          {(!isLoadingHistory || messages.length > 0) && (
            <Box sx={{ minHeight: 'calc(100% - 40px)', display: 'flex', flexDirection: 'column' }}>
              {renderMessages()}
              <div ref={messagesEndRef} />
            </Box>
          )}

          {hasMoreHistory && !isLoadingHistory && selectedSessionId && messages.length > 0 && (
             <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                <Button onClick={() => loadMoreChatHistory()} variant="outlined">
                    加载更多消息
                </Button>
             </Box>
          )}
          {isLoadingHistory && messages.length > 0 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 1 }}><CircularProgress size={24} /></Box>
          )}
        </Box>

        <Box sx={{ p: 3, borderTop: 1, borderColor: 'divider', bgcolor: 'background.paper' }}>
          {renderInputBox(false)}
        </Box>
      </Box>
    </Box>
  );
};

export default ChatPage; 