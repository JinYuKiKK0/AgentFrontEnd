import React from 'react';
import {
  Box,
  Typography,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  IconButton,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Chat as ChatIcon,
} from '@mui/icons-material';
import { ChatSession } from '../../../types/api';
import { formatTimestamp } from '../../../utils/formatters';

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
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* 会话列表头部 */}
      <Box sx={{ p: 3, borderBottom: 1, borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 500 }}>
            对话
          </Typography>
        </Box>
        <Button
          variant="contained"
          fullWidth
          startIcon={<AddIcon />}
          onClick={onCreateSession}
          disabled={loading}
          sx={{
            textTransform: 'none',
            fontWeight: 500,
            borderRadius: 2,
          }}
        >
          新对话
        </Button>
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
            <ChatIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2, opacity: 0.5 }} />
            <Typography variant="body2" color="text.secondary" gutterBottom>
              还没有对话
            </Typography>
            <Typography variant="caption" color="text.secondary">
              点击上方按钮开始新对话
            </Typography>
          </Box>
        ) : (
          <List sx={{ p: 0 }}>
            {sessions.map((session) => (
              <ListItem key={session.conversationId} disablePadding>
                <ListItemButton
                  selected={selectedSessionId === session.conversationId}
                  onClick={() => onSelectSession(session.conversationId)}
                  sx={{
                    px: 3,
                    py: 2,
                    borderRadius: 0,
                    '&.Mui-selected': {
                      backgroundColor: '#e3f2fd',
                      borderRight: 3,
                      borderRightColor: 'primary.main',
                      '&:hover': {
                        backgroundColor: '#bbdefb',
                      },
                    },
                    '&:hover': {
                      backgroundColor: 'action.hover',
                    },
                  }}
                >
                  <ListItemText
                    primary={session.title}
                    secondary={
                      <Typography variant="caption" color="text.secondary">
                        {formatTimestamp(session.updatedAt)}
                      </Typography>
                    }
                    primaryTypographyProps={{ 
                      noWrap: true,
                      fontWeight: selectedSessionId === session.conversationId ? 500 : 400,
                      fontSize: '0.875rem',
                    }}
                    sx={{ mr: 1 }}
                  />
                  <IconButton
                    size="small"
                    onClick={(e) => onDeleteSession(session.conversationId, e)}
                    sx={{
                      opacity: 0.6,
                      '&:hover': {
                        opacity: 1,
                        color: 'error.main',
                      },
                    }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        )}
      </Box>
    </Box>
  );
};

export default SessionList; 