import React, { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Switch,
  FormControlLabel,
  TextField,
  Button,
  Divider,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
} from '@mui/material';
import {
  Save as SaveIcon,
  Restore as RestoreIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';

const SettingsPage: React.FC = () => {
  const [settings, setSettings] = useState({
    darkMode: false,
    autoSave: true,
    notifications: true,
    apiUrl: 'http://localhost:8080',
    maxTokens: 2048,
    temperature: 0.7,
  });
  
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSave = () => {
    // 这里应该保存设置到localStorage或发送到后端
    localStorage.setItem('appSettings', JSON.stringify(settings));
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleReset = () => {
    setSettings({
      darkMode: false,
      autoSave: true,
      notifications: true,
      apiUrl: 'http://localhost:8080',
      maxTokens: 2048,
      temperature: 0.7,
    });
  };

  const handleClearData = () => {
    if (window.confirm('确定要清除所有本地数据吗？此操作不可撤销。')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        设置
      </Typography>
      
      {saveSuccess && (
        <Alert severity="success" sx={{ mb: 3 }}>
          设置已保存成功！
        </Alert>
      )}

      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          界面设置
        </Typography>
        
        <List>
          <ListItem>
            <ListItemText
              primary="深色模式"
              secondary="启用深色主题界面"
            />
            <ListItemSecondaryAction>
              <Switch
                checked={settings.darkMode}
                onChange={(e) => handleSettingChange('darkMode', e.target.checked)}
              />
            </ListItemSecondaryAction>
          </ListItem>
          
          <ListItem>
            <ListItemText
              primary="自动保存"
              secondary="自动保存对话内容"
            />
            <ListItemSecondaryAction>
              <Switch
                checked={settings.autoSave}
                onChange={(e) => handleSettingChange('autoSave', e.target.checked)}
              />
            </ListItemSecondaryAction>
          </ListItem>
          
          <ListItem>
            <ListItemText
              primary="通知"
              secondary="启用桌面通知"
            />
            <ListItemSecondaryAction>
              <Switch
                checked={settings.notifications}
                onChange={(e) => handleSettingChange('notifications', e.target.checked)}
              />
            </ListItemSecondaryAction>
          </ListItem>
        </List>
      </Paper>

      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          API 设置
        </Typography>
        
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="API 基础URL"
            value={settings.apiUrl}
            onChange={(e) => handleSettingChange('apiUrl', e.target.value)}
            fullWidth
            helperText="后端API服务器地址"
          />
          
          <TextField
            label="最大Token数"
            type="number"
            value={settings.maxTokens}
            onChange={(e) => handleSettingChange('maxTokens', parseInt(e.target.value))}
            inputProps={{ min: 100, max: 4096 }}
            helperText="AI响应的最大token数量"
          />
          
          <TextField
            label="温度参数"
            type="number"
            value={settings.temperature}
            onChange={(e) => handleSettingChange('temperature', parseFloat(e.target.value))}
            inputProps={{ min: 0, max: 2, step: 0.1 }}
            helperText="控制AI回答的创造性，0-2之间"
          />
        </Box>
      </Paper>

      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          数据管理
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={handleSave}
          >
            保存设置
          </Button>
          
          <Button
            variant="outlined"
            startIcon={<RestoreIcon />}
            onClick={handleReset}
          >
            重置设置
          </Button>
          
          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={handleClearData}
          >
            清除所有数据
          </Button>
        </Box>
      </Paper>

      <Paper elevation={2} sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          关于
        </Typography>
        
        <Typography variant="body2" color="text.secondary" paragraph>
          AI 智能助手 v0.0.1
        </Typography>
        
        <Typography variant="body2" color="text.secondary" paragraph>
          基于 React + TypeScript + MUI 构建的现代化聊天应用。
        </Typography>
        
        <Typography variant="body2" color="text.secondary">
          技术栈：Vite, React 18, Material-UI, Tailwind CSS, Axios, Zustand
        </Typography>
      </Paper>
    </Container>
  );
};

export default SettingsPage; 