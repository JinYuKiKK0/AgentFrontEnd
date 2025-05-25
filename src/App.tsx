import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline, Box } from '@mui/material';
import theme from './config/theme';
import ErrorBoundary from './components/common/ErrorBoundary';
import AppHeader from './components/layout/AppHeader';
import ChatPage from './pages/ChatPage';
import SettingsPage from './pages/SettingsPage';

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
            <AppHeader />
            <Box sx={{ flex: 1, overflow: 'hidden' }}>
              <Routes>
                <Route path="/" element={<Navigate to="/chat" replace />} />
                <Route path="/chat" element={<ChatPage />} />
                <Route path="/settings" element={<SettingsPage />} />
              </Routes>
            </Box>
          </Box>
        </Router>
      </ThemeProvider>
    </ErrorBoundary>
  );
};

export default App;
