import React from 'react';
import { Box, Container, Typography, Link as MuiLink } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import RegisterForm from '../features/auth/components/RegisterForm';

const RegisterPage: React.FC = () => {
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
        <RegisterForm />
        <Typography variant="body2" sx={{ mt: 2, textAlign: 'center' }}>
          Already have an account?{' '}
          <MuiLink component={RouterLink} to="/login" variant="body2">
            Sign In
          </MuiLink>
        </Typography>
      </Box>
    </Container>
  );
};

export default RegisterPage; 