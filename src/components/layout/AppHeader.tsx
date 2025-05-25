import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Button,
} from '@mui/material';
import {
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
    <AppBar 
      position="static" 
      elevation={0}
      sx={{
        bgcolor: 'background.paper',
        color: 'text.primary',
        borderBottom: 1,
        borderColor: 'divider',
      }}
    >
      <Toolbar sx={{ px: 3 }}>
        {/* 左侧留空或放置简单标识 */}
        <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
          <Typography variant="h6" component="div" sx={{ fontWeight: 500, color: 'text.primary' }}>
            聊天
          </Typography>
        </Box>

        {/* 导航按钮 */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Button
            color={location.pathname === '/chat' ? 'primary' : 'inherit'}
            startIcon={<Chat />}
            onClick={() => handleNavigation('/chat')}
            sx={{
              textTransform: 'none',
              fontWeight: 500,
              px: 2,
              py: 1,
              borderRadius: 2,
              bgcolor: location.pathname === '/chat' ? '#e3f2fd' : 'transparent',
              '&:hover': {
                bgcolor: location.pathname === '/chat' ? '#bbdefb' : 'action.hover',
              },
            }}
          >
            聊天
          </Button>
          
          <Button
            color={location.pathname === '/settings' ? 'primary' : 'inherit'}
            startIcon={<Settings />}
            onClick={() => handleNavigation('/settings')}
            sx={{
              textTransform: 'none',
              fontWeight: 500,
              px: 2,
              py: 1,
              borderRadius: 2,
              bgcolor: location.pathname === '/settings' ? '#e3f2fd' : 'transparent',
              '&:hover': {
                bgcolor: location.pathname === '/settings' ? '#bbdefb' : 'action.hover',
              },
            }}
          >
            设置
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default AppHeader; 