import { createTheme, ThemeOptions } from '@mui/material/styles';

// 定义主题配置
const themeOptions: ThemeOptions = {
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2', // Material Design Blue 700
      light: '#42a5f5', // Blue 400
      dark: '#1565c0', // Blue 800
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#dc004e', // Material Design Pink A400
      light: '#ff5983',
      dark: '#9a0036',
      contrastText: '#ffffff',
    },
    error: {
      main: '#d32f2f', // Red 700
      light: '#ef5350',
      dark: '#c62828',
    },
    warning: {
      main: '#ed6c02', // Orange 700
      light: '#ff9800',
      dark: '#e65100',
    },
    info: {
      main: '#0288d1', // Light Blue 700
      light: '#03a9f4',
      dark: '#01579b',
    },
    success: {
      main: '#2e7d32', // Green 700
      light: '#4caf50',
      dark: '#1b5e20',
    },
    background: {
      default: '#fafafa', // Grey 50
      paper: '#ffffff',
    },
    text: {
      primary: 'rgba(0, 0, 0, 0.87)',
      secondary: 'rgba(0, 0, 0, 0.6)',
      disabled: 'rgba(0, 0, 0, 0.38)',
    },
  },
  typography: {
    fontFamily: [
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
      '"Apple Color Emoji"',
      '"Segoe UI Emoji"',
      '"Segoe UI Symbol"',
    ].join(','),
    h1: {
      fontSize: '2.125rem', // 34px
      fontWeight: 300,
      lineHeight: 1.167,
    },
    h2: {
      fontSize: '1.5rem', // 24px
      fontWeight: 400,
      lineHeight: 1.2,
    },
    h3: {
      fontSize: '1.25rem', // 20px
      fontWeight: 500,
      lineHeight: 1.167,
    },
    h4: {
      fontSize: '1.125rem', // 18px
      fontWeight: 500,
      lineHeight: 1.235,
    },
    h5: {
      fontSize: '1rem', // 16px
      fontWeight: 500,
      lineHeight: 1.334,
    },
    h6: {
      fontSize: '0.875rem', // 14px
      fontWeight: 500,
      lineHeight: 1.6,
    },
    body1: {
      fontSize: '1rem', // 16px
      fontWeight: 400,
      lineHeight: 1.5,
    },
    body2: {
      fontSize: '0.875rem', // 14px
      fontWeight: 400,
      lineHeight: 1.43,
    },
    caption: {
      fontSize: '0.75rem', // 12px
      fontWeight: 400,
      lineHeight: 1.66,
    },
    button: {
      fontSize: '0.875rem', // 14px
      fontWeight: 500,
      lineHeight: 1.75,
      textTransform: 'uppercase',
    },
  },
  spacing: 8, // 基础间距单位：8px
  shape: {
    borderRadius: 4, // 默认圆角
  },
  components: {
    // 自定义组件默认样式
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8, // 按钮圆角
          textTransform: 'none', // 不转换大小写
          fontWeight: 500,
        },
        contained: {
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          '&:hover': {
            boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12, // 卡片圆角
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8, // 输入框圆角
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
        elevation1: {
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        },
        elevation2: {
          boxShadow: '0 4px 8px rgba(0,0,0,0.12)',
        },
        elevation3: {
          boxShadow: '0 6px 12px rgba(0,0,0,0.15)',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        },
      },
    },
  },
  transitions: {
    duration: {
      shortest: 150,
      shorter: 200,
      short: 250,
      standard: 300,
      complex: 375,
      enteringScreen: 225,
      leavingScreen: 195,
    },
    easing: {
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
      easeOut: 'cubic-bezier(0.0, 0, 0.2, 1)',
      easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
      sharp: 'cubic-bezier(0.4, 0, 0.6, 1)',
    },
  },
};

// 创建主题实例
const theme = createTheme(themeOptions);

export default theme; 