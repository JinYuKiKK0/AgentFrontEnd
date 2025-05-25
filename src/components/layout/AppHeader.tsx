import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  IconButton,
  Tooltip,
  Button,
} from '@mui/material';
import {
  SmartToy,
  GitHub,
  Settings,
  Chat,
} from '@mui/icons-material';

const AppHeader: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  return (
    <AppBar position="static" elevation={1}>
      <Toolbar>
        {/* Logo和标题 */}
        <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
          <SmartToy sx={{ mr: 2, fontSize: 32 }} />
          <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
            AI 智能助手
          </Typography>
          <Typography 
            variant="caption" 
            sx={{ 
              ml: 1, 
              px: 1, 
              py: 0.5, 
              bgcolor: 'rgba(255,255,255,0.2)', 
              borderRadius: 1,
              fontSize: '0.7rem',
            }}
          >
            v0.0.1
          </Typography>
        </Box>

        {/* 导航按钮 */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mr: 2 }}>
          <Button
            color="inherit"
            startIcon={<Chat />}
            onClick={() => handleNavigation('/chat')}
            sx={{
              bgcolor: location.pathname === '/chat' ? 'rgba(255,255,255,0.1)' : 'transparent',
              '&:hover': {
                bgcolor: 'rgba(255,255,255,0.2)',
              },
            }}
          >
            聊天
          </Button>
          
          <Button
            color="inherit"
            startIcon={<Settings />}
            onClick={() => handleNavigation('/settings')}
            sx={{
              bgcolor: location.pathname === '/settings' ? 'rgba(255,255,255,0.1)' : 'transparent',
              '&:hover': {
                bgcolor: 'rgba(255,255,255,0.2)',
              },
            }}
          >
            设置
          </Button>
        </Box>

        {/* 右侧操作按钮 */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Tooltip title="GitHub">
            <IconButton 
              color="inherit" 
              size="small"
              onClick={() => window.open('https://github.com', '_blank')}
            >
              <GitHub />
            </IconButton>
          </Tooltip>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default AppHeader; 