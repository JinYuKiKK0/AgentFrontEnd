import React from 'react';
import { useNavigate, useLocation, Link as RouterLink } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Button,
  Avatar,
  Tooltip,
  IconButton,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  Settings,
  Chat,
  Logout as LogoutIcon,
  Login as LoginIcon,
  PersonAdd as PersonAddIcon,
} from '@mui/icons-material';
import { useAuthStore } from '../../features/auth/stores/authStore';

const AppHeader: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user, logout } = useAuthStore();

  const [anchorElUser, setAnchorElUser] = React.useState<null | HTMLElement>(null);

  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleLogout = () => {
    handleCloseUserMenu();
    logout(navigate);
  };

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
        <Typography variant="h6" component="div" sx={{ fontWeight: 500, color: 'primary.main', flexGrow: 1, cursor: 'pointer' }}
          onClick={() => navigate(isAuthenticated ? '/chat' : '/login')}
        >
          AriaVerse
        </Typography>

        {isAuthenticated && user ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Button
              color={location.pathname === '/chat' ? 'primary' : 'inherit'}
              startIcon={<Chat />}
              onClick={() => handleNavigation('/chat')}
              sx={{
                textTransform: 'none',
                fontWeight: location.pathname === '/chat' ? 600 : 500,
                px: 2, py: 1, borderRadius: 2,
                color: location.pathname === '/chat' ? 'primary.main' : 'text.secondary',
                bgcolor: location.pathname === '/chat' ? 'primary.light' : 'transparent',
                '&:hover': { bgcolor: location.pathname === '/chat' ? 'primary.dark' : 'action.hover' },
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
                fontWeight: location.pathname === '/settings' ? 600 : 500,
                px: 2, py: 1, borderRadius: 2,
                color: location.pathname === '/settings' ? 'primary.main' : 'text.secondary',
                bgcolor: location.pathname === '/settings' ? 'primary.light' : 'transparent',
                '&:hover': { bgcolor: location.pathname === '/settings' ? 'primary.dark' : 'action.hover' },
              }}
            >
              设置
            </Button>
            <Tooltip title="Open settings">
              <IconButton onClick={handleOpenUserMenu} sx={{ p: 0, ml: 1 }}>
                <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32 }}>
                  {user.username ? user.username.charAt(0).toUpperCase() : 'U'}
                </Avatar>
              </IconButton>
            </Tooltip>
            <Menu
              sx={{ mt: '45px' }}
              id="menu-appbar"
              anchorEl={anchorElUser}
              anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
              keepMounted
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
              open={Boolean(anchorElUser)}
              onClose={handleCloseUserMenu}
            >
              <MenuItem disabled>
                <Typography textAlign="center">{user.username}</Typography>
              </MenuItem>
              <MenuItem onClick={handleLogout}>
                <LogoutIcon sx={{ mr: 1, fontSize: '1.25rem'}} />
                <Typography textAlign="center">登出</Typography>
              </MenuItem>
            </Menu>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Button 
              variant='outlined' 
              color="primary"
              startIcon={<LoginIcon />}
              component={RouterLink} 
              to="/login"
              sx={{ textTransform: 'none', fontWeight: 500, borderRadius: 2 }}
            >
              登录
            </Button>
            <Button 
              variant="contained" 
              color="primary" 
              startIcon={<PersonAddIcon />}
              component={RouterLink} 
              to="/register"
              sx={{ textTransform: 'none', fontWeight: 500, borderRadius: 2 }}
            >
              注册
            </Button>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default AppHeader; 