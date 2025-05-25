import React, { useState } from 'react';
import { Box, Paper, Typography, Avatar, CircularProgress, IconButton, Tooltip, Snackbar, Alert } from '@mui/material';
import { Person, SmartToy, ContentCopy, MoreVert } from '@mui/icons-material';
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
        className="message-enter"
        onMouseEnter={() => setShowActions(true)}
        onMouseLeave={() => setShowActions(false)}
        sx={{
          display: 'flex',
          justifyContent: isUser ? 'flex-end' : 'flex-start',
          mb: 2,
          alignItems: 'flex-start',
          gap: 1,
          position: 'relative',
        }}
      >
        {/* AI头像 */}
        {!isUser && (
          <Avatar
            sx={{
              bgcolor: 'primary.main',
              width: 32,
              height: 32,
              mt: 0.5,
            }}
          >
            <SmartToy fontSize="small" />
          </Avatar>
        )}

        {/* 消息内容 */}
        <Paper
          elevation={1}
          sx={{
            p: 2,
            maxWidth: '70%',
            backgroundColor: isUser ? 'primary.main' : 'grey.100',
            color: isUser ? 'primary.contrastText' : 'text.primary',
            borderRadius: 2,
            position: 'relative',
            // 添加消息尾巴样式
            '&::before': isUser ? {
              content: '""',
              position: 'absolute',
              top: 8,
              right: -8,
              width: 0,
              height: 0,
              borderLeft: '8px solid',
              borderLeftColor: 'primary.main',
              borderTop: '8px solid transparent',
              borderBottom: '8px solid transparent',
            } : {
              content: '""',
              position: 'absolute',
              top: 8,
              left: -8,
              width: 0,
              height: 0,
              borderRight: '8px solid',
              borderRightColor: 'grey.100',
              borderTop: '8px solid transparent',
              borderBottom: '8px solid transparent',
            },
          }}
        >
          <Typography 
            variant="body1" 
            sx={{ 
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              lineHeight: 1.5,
            }}
          >
            {message.content}
          </Typography>
          
          {/* 流式传输指示器 */}
          {isStreaming && (
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
              <CircularProgress size={16} sx={{ mr: 1 }} />
              <Typography variant="caption" sx={{ opacity: 0.7 }}>
                正在输入...
              </Typography>
            </Box>
          )}
          
          {/* 时间戳 */}
          <Typography 
            variant="caption" 
            sx={{ 
              display: 'block',
              mt: 0.5,
              opacity: 0.7,
              fontSize: '0.7rem',
            }}
          >
            {new Date(message.timestamp).toLocaleTimeString('zh-CN', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Typography>

          {/* 消息操作按钮 */}
          {showActions && !isStreaming && (
            <Box
              sx={{
                position: 'absolute',
                top: -8,
                right: isUser ? -40 : 8,
                display: 'flex',
                gap: 0.5,
                bgcolor: 'background.paper',
                borderRadius: 1,
                boxShadow: 1,
                p: 0.5,
              }}
            >
              <Tooltip title="复制消息">
                <IconButton size="small" onClick={handleCopy}>
                  <ContentCopy fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="更多操作">
                <IconButton size="small">
                  <MoreVert fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          )}
        </Paper>

        {/* 用户头像 */}
        {isUser && (
          <Avatar
            sx={{
              bgcolor: 'secondary.main',
              width: 32,
              height: 32,
              mt: 0.5,
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