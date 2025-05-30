import React from 'react';
import { Box, Container, Typography, Link as MuiLink } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import LoginForm from '../features/auth/components/LoginForm';

const LoginPage: React.FC = () => {
  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <LoginForm />
        <Typography variant="body2" sx={{ mt: 2, textAlign: 'center' }}>
          Don't have an account?{' '}
          <MuiLink component={RouterLink} to="/register" variant="body2">
            Sign Up
          </MuiLink>
        </Typography>
      </Box>
    </Container>
  );
};

export default LoginPage; 