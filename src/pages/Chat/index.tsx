import React, { useState, useRef, useEffect } from 'react'
import {
  Box,
  Paper,
  Typography,
  TextField,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Drawer,
  AppBar,
  Toolbar,
  Divider,
  Avatar,
  Chip,
  Button,
  CircularProgress,
  Container,
  useTheme,
  alpha
} from '@mui/material'
import {
  Send as SendIcon,
  Menu as MenuIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  SmartToy as BotIcon,
  Person as PersonIcon
} from '@mui/icons-material'
import { useSSE } from '@/hooks/useSSE'
import { useCreateSession, useChatSessions, useDeleteSession } from '@/features/chat/hooks/useChatAPI'

interface Message {
  id: string
  content: string
  isUser: boolean
  timestamp: Date
}

const DEMO_USER_ID = 'demo-user-001'
const API_BASE = 'http://localhost:8080'

export default function ChatPage() {
  const theme = useTheme()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null)
  const [pendingPrompt, setPendingPrompt] = useState<string>('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  // API hooks
  const createSessionMutation = useCreateSession()
  const { data: sessions = [] } = useChatSessions(DEMO_USER_ID)
  const deleteSessionMutation = useDeleteSession()

  // SSE chat stream - 构建正确的URL
  const chatUrl = currentSessionId && pendingPrompt
    ? `${API_BASE}/ai/chat?prompt=${encodeURIComponent(pendingPrompt)}&chatId=${currentSessionId}`
    : null

  const { data: streamData, isLoading: isStreaming, startStreaming, stopStreaming } = useSSE(chatUrl, {
    onComplete: () => {
      console.log('流式响应完成')
      setPendingPrompt('')
    }
  })

  // 滚动到底部
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, streamData])

  // 创建新会话
  const handleNewChat = async () => {
    try {
      const result = await createSessionMutation.mutateAsync({
        userId: DEMO_USER_ID,
        title: '新的聊天'
      })
      if (result?.data) {
        setCurrentSessionId(result.data)
        setMessages([])
        setSidebarOpen(false)
      }
    } catch (error) {
      console.error('创建会话失败:', error)
    }
  }

  // 发送消息
  const handleSendMessage = async () => {
    if (!inputValue.trim()) return

    const prompt = inputValue.trim()
    
    // 如果没有会话，先创建
    if (!currentSessionId) {
      try {
        const result = await createSessionMutation.mutateAsync({
          userId: DEMO_USER_ID,
          title: prompt.length > 20 ? prompt.substring(0, 20) + '...' : prompt
        })
        if (result?.data) {
          setCurrentSessionId(result.data)
          setMessages([])
        }
      } catch (error) {
        console.error('创建会话失败:', error)
        return
      }
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      content: prompt,
      isUser: true,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    
    const aiMessage: Message = {
      id: (Date.now() + 1).toString(),
      content: '',
      isUser: false,
      timestamp: new Date()
    }
    setMessages(prev => [...prev, aiMessage])

    // 设置待发送的提示词并启动SSE
    setPendingPrompt(prompt)
    setInputValue('')
    
    // 延迟启动确保状态已更新
    setTimeout(() => {
      startStreaming()
    }, 100)
  }

  // 更新AI消息内容
  useEffect(() => {
    if (streamData && messages.length > 0 && !messages[messages.length - 1].isUser) {
      setMessages(prev => {
        const newMessages = [...prev]
        if (newMessages.length > 0 && !newMessages[newMessages.length - 1].isUser) {
          newMessages[newMessages.length - 1].content = streamData
        }
        return newMessages
      })
    }
  }, [streamData, messages])

  // 删除会话
  const handleDeleteSession = async (sessionId: string) => {
    try {
      await deleteSessionMutation.mutateAsync({
        userId: DEMO_USER_ID,
        conversationId: sessionId
      })
      if (sessionId === currentSessionId) {
        setCurrentSessionId(null)
        setMessages([])
      }
    } catch (error) {
      console.error('删除会话失败:', error)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      {/* 侧边栏 */}
      <Drawer
        variant="temporary"
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        sx={{
          '& .MuiDrawer-paper': {
            width: 280,
            bgcolor: 'background.paper',
          },
        }}
      >
        <Box sx={{ p: 2 }}>
          <Button
            fullWidth
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleNewChat}
            sx={{ mb: 2 }}
          >
            新建聊天
          </Button>
          <Typography variant="h6" gutterBottom>
            聊天历史
          </Typography>
          <Divider sx={{ mb: 1 }} />
          <List>
            {sessions.map((session) => (
              <ListItem
                key={session.conversationId}
                sx={{
                  cursor: 'pointer',
                  borderRadius: 1,
                  mb: 0.5,
                  bgcolor: session.conversationId === currentSessionId 
                    ? alpha(theme.palette.primary.main, 0.1) 
                    : 'transparent',
                  '&:hover': {
                    bgcolor: alpha(theme.palette.primary.main, 0.05),
                  }
                }}
                onClick={() => {
                  setCurrentSessionId(session.conversationId || null)
                  setSidebarOpen(false)
                }}
                secondaryAction={
                  <IconButton 
                    edge="end" 
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDeleteSession(session.conversationId!)
                    }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                }
              >
                <ListItemText
                  primary={session.title || '未命名聊天'}
                  secondary={session.lastMessage}
                  primaryTypographyProps={{ 
                    noWrap: true,
                    fontSize: '0.9rem'
                  }}
                  secondaryTypographyProps={{ 
                    noWrap: true,
                    fontSize: '0.8rem'
                  }}
                />
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>

      {/* 主要内容区域 */}
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        {/* 顶部工具栏 */}
        <AppBar position="static" elevation={1} sx={{ bgcolor: 'background.paper', color: 'text.primary' }}>
          <Toolbar>
            <IconButton
              edge="start"
              onClick={() => setSidebarOpen(true)}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              MyAgent - AI 助手
            </Typography>
            <Chip 
              label={currentSessionId ? '聊天中' : '等待新会话'} 
              variant="outlined" 
              size="small"
              color={currentSessionId ? 'primary' : 'default'}
            />
          </Toolbar>
        </AppBar>

        {/* 消息区域 */}
        <Box sx={{ flexGrow: 1, overflow: 'auto', p: 2 }}>
          <Container maxWidth="md">
            {messages.length === 0 ? (
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '100%',
                  textAlign: 'center',
                  py: 8
                }}
              >
                <BotIcon sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
                <Typography variant="h4" gutterBottom>
                  欢迎使用 MyAgent
                </Typography>
                <Typography variant="body1" color="textSecondary">
                  开始与AI助手对话，体验智能问答的乐趣
                </Typography>
              </Box>
            ) : (
              messages.map((message) => (
                <Box
                  key={message.id}
                  sx={{
                    display: 'flex',
                    mb: 3,
                    alignItems: 'flex-start',
                    flexDirection: message.isUser ? 'row-reverse' : 'row',
                  }}
                >
                  <Avatar
                    sx={{
                      bgcolor: message.isUser ? 'primary.main' : 'secondary.main',
                      mx: 1,
                    }}
                  >
                    {message.isUser ? <PersonIcon /> : <BotIcon />}
                  </Avatar>
                  <Paper
                    sx={{
                      p: 2,
                      maxWidth: '70%',
                      bgcolor: message.isUser 
                        ? 'primary.main' 
                        : 'background.paper',
                      color: message.isUser 
                        ? 'primary.contrastText' 
                        : 'text.primary',
                      borderRadius: 2,
                      boxShadow: 1,
                    }}
                  >
                    <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                      {message.content}
                      {!message.isUser && isStreaming && message.id === messages[messages.length - 1]?.id && (
                        <CircularProgress size={16} sx={{ ml: 1 }} />
                      )}
                    </Typography>
                  </Paper>
                </Box>
              ))
            )}
            <div ref={messagesEndRef} />
          </Container>
        </Box>

        {/* 输入区域 */}
        <Paper
          sx={{
            p: 2,
            borderRadius: 0,
            borderTop: 1,
            borderColor: 'divider',
          }}
        >
          <Container maxWidth="md">
            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField
                fullWidth
                multiline
                maxRows={4}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="输入您的问题..."
                variant="outlined"
                disabled={isStreaming}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  },
                }}
              />
              <IconButton
                color="primary"
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isStreaming}
                sx={{
                  bgcolor: 'primary.main',
                  color: 'white',
                  '&:hover': {
                    bgcolor: 'primary.dark',
                  },
                  '&:disabled': {
                    bgcolor: 'action.disabledBackground',
                  },
                }}
              >
                <SendIcon />
              </IconButton>
            </Box>
          </Container>
        </Paper>
      </Box>
    </Box>
  )
} 