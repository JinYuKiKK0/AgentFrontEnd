import React, { useState } from 'react';
import { Box, Paper, Typography, Avatar, CircularProgress, IconButton, Tooltip, Snackbar, Alert } from '@mui/material';
import { Person, SmartToy, ContentCopy } from '@mui/icons-material';
import { ChatMessage } from '../../../types/api';
import { copyToClipboard } from '../../../utils/formatters';

interface MessageBubbleProps {
  message: ChatMessage;
  isStreaming?: boolean;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isStreaming = false }) => {
  const [showActions, setShowActions] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const isUser = message.role === 'user';
  
  const handleCopy = async () => {
    const success = await copyToClipboard(message.content);
    setCopySuccess(success);
  };

  const handleCloseCopyAlert = () => {
    setCopySuccess(false);
  };
  
  return (
    <>
      <Box
        onMouseEnter={() => setShowActions(true)}
        onMouseLeave={() => setShowActions(false)}
        sx={{
          display: 'flex',
          justifyContent: isUser ? 'flex-end' : 'flex-start',
          mb: 3,
          alignItems: 'flex-start',
          gap: 2,
          position: 'relative',
        }}
      >
        {/* AI头像 */}
        {!isUser && (
          <Avatar
            sx={{
              bgcolor: 'primary.main',
              width: 36,
              height: 36,
            }}
          >
            <SmartToy fontSize="small" />
          </Avatar>
        )}

        {/* 消息内容 */}
        <Box
          sx={{
            maxWidth: '70%',
            position: 'relative',
          }}
        >
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              backgroundColor: isUser ? 'primary.main' : 'background.paper',
              color: isUser ? 'primary.contrastText' : 'text.primary',
              borderRadius: 3,
              border: isUser ? 'none' : 1,
              borderColor: 'divider',
              position: 'relative',
            }}
          >
            <Typography 
              variant="body1" 
              sx={{ 
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                lineHeight: 1.6,
              }}
            >
              {message.content}
            </Typography>
            
            {/* 流式传输指示器 */}
            {isStreaming && (
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1.5 }}>
                <CircularProgress size={16} sx={{ mr: 1 }} />
                <Typography variant="caption" sx={{ opacity: 0.7 }}>
                  正在输入...
                </Typography>
              </Box>
            )}
          </Paper>

          {/* 时间戳和操作按钮 */}
          <Box 
            sx={{ 
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mt: 1,
              px: 1,
            }}
          >
            <Typography 
              variant="caption" 
              sx={{ 
                color: 'text.secondary',
                fontSize: '0.75rem',
              }}
            >
              {new Date(message.timestamp).toLocaleTimeString('zh-CN', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Typography>

            {/* 消息操作按钮 */}
            {showActions && !isStreaming && (
              <Tooltip title="复制消息">
                <IconButton 
                  size="small" 
                  onClick={handleCopy}
                  sx={{
                    opacity: 0.7,
                    '&:hover': {
                      opacity: 1,
                    },
                  }}
                >
                  <ContentCopy fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        </Box>

        {/* 用户头像 */}
        {isUser && (
          <Avatar
            sx={{
              bgcolor: 'secondary.main',
              width: 36,
              height: 36,
            }}
          >
            <Person fontSize="small" />
          </Avatar>
        )}
      </Box>

      {/* 复制成功提示 */}
      <Snackbar
        open={copySuccess}
        autoHideDuration={2000}
        onClose={handleCloseCopyAlert}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseCopyAlert} severity="success" sx={{ width: '100%' }}>
          消息已复制到剪贴板
        </Alert>
      </Snackbar>
    </>
  );
};

export default MessageBubble; 