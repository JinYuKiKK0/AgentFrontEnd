import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  IconButton,
  Alert,
  CircularProgress,
  Tooltip,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Chat as ChatIcon,
} from '@mui/icons-material';
import { ChatSession } from '../../../types/api';
import { formatTimestamp, formatMessagePreview } from '../../../utils/formatters';

interface SessionListProps {
  sessions: ChatSession[];
  selectedSessionId: string;
  loading: boolean;
  error: string | null;
  onCreateSession: () => void;
  onSelectSession: (sessionId: string) => void;
  onDeleteSession: (sessionId: string, event: React.MouseEvent) => void;
}

const SessionList: React.FC<SessionListProps> = ({
  sessions,
  selectedSessionId,
  loading,
  error,
  onCreateSession,
  onSelectSession,
  onDeleteSession,
}) => {
  return (
    <Paper elevation={2} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* 会话列表头部 */}
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <ChatIcon />
            对话列表
          </Typography>
          <Tooltip title="创建新对话">
            <Button
              variant="contained"
              size="small"
              startIcon={<AddIcon />}
              onClick={onCreateSession}
              disabled={loading}
              sx={{ minWidth: 'auto' }}
            >
              新对话
            </Button>
          </Tooltip>
        </Box>
      </Box>

      {/* 会话列表内容 */}
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        {error && (
          <Alert severity="error" sx={{ m: 2 }}>
            {error}
          </Alert>
        )}
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : sessions.length === 0 ? (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              p: 4,
              textAlign: 'center',
              height: '100%',
            }}
          >
            <ChatIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
            <Typography variant="body1" color="text.secondary" gutterBottom>
              还没有对话
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              点击"新对话"开始您的第一次聊天
            </Typography>
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={onCreateSession}
            >
              创建对话
            </Button>
          </Box>
        ) : (
          <List sx={{ p: 0 }}>
            {sessions.map((session) => (
              <ListItem key={session.conversationId} disablePadding>
                <ListItemButton
                  selected={selectedSessionId === session.conversationId}
                  onClick={() => onSelectSession(session.conversationId)}
                  sx={{
                    borderRadius: 0,
                    py: 1.5,
                    '&.Mui-selected': {
                      backgroundColor: 'primary.light',
                      color: 'primary.contrastText',
                      '&:hover': {
                        backgroundColor: 'primary.main',
                      },
                    },
                  }}
                >
                  <ListItemText
                    primary={session.title}
                    secondary={
                      <Box>
                        <Typography
                          variant="body2"
                          sx={{
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            maxWidth: '200px',
                            mb: 0.5,
                          }}
                        >
                          {formatMessagePreview(session.lastMessage || '暂无消息', 30)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {formatTimestamp(session.updatedAt)}
                        </Typography>
                      </Box>
                    }
                    primaryTypographyProps={{ 
                      noWrap: true,
                      fontWeight: selectedSessionId === session.conversationId ? 600 : 400,
                    }}
                  />
                  <Tooltip title="删除对话">
                    <IconButton
                      size="small"
                      onClick={(e) => onDeleteSession(session.conversationId, e)}
                      sx={{
                        opacity: 0.7,
                        '&:hover': {
                          opacity: 1,
                          color: 'error.main',
                        },
                      }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        )}
      </Box>
    </Paper>
  );
};

export default SessionList; 