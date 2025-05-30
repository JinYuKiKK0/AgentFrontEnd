import { createTheme, ThemeOptions } from '@mui/material/styles';

// 定义主题配置 - 专注于PC端桌面应用
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
    // 中英文字体配置，针对桌面环境优化
    fontFamily: [
      'Roboto',
      'Microsoft YaHei',
      '微软雅黑',
      'PingFang SC',
      'Hiragino Sans GB',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
    h1: {
      fontSize: '2.125rem', // 34px - 页面主标题
      fontWeight: 300,
      lineHeight: 1.235,
      letterSpacing: '-0.00735em',
    },
    h2: {
      fontSize: '1.5rem', // 24px - 章节标题
      fontWeight: 400,
      lineHeight: 1.334,
      letterSpacing: '0em',
    },
    h3: {
      fontSize: '1.25rem', // 20px - 子章节标题
      fontWeight: 500,
      lineHeight: 1.6,
      letterSpacing: '0.0075em',
    },
    h4: {
      fontSize: '1.125rem', // 18px - 组件标题
      fontWeight: 500,
      lineHeight: 1.235,
      letterSpacing: '0.00735em',
    },
    h5: {
      fontSize: '1rem', // 16px
      fontWeight: 500,
      lineHeight: 1.334,
      letterSpacing: '0em',
    },
    h6: {
      fontSize: '0.875rem', // 14px
      fontWeight: 500,
      lineHeight: 1.6,
      letterSpacing: '0.0075em',
    },
    body1: {
      fontSize: '1rem', // 16px - 主要正文
      fontWeight: 400,
      lineHeight: 1.5,
      letterSpacing: '0.00938em',
    },
    body2: {
      fontSize: '0.875rem', // 14px - 次要正文
      fontWeight: 400,
      lineHeight: 1.43,
      letterSpacing: '0.01071em',
    },
    caption: {
      fontSize: '0.75rem', // 12px - 辅助信息
      fontWeight: 400,
      lineHeight: 1.66,
      letterSpacing: '0.03333em',
    },
    button: {
      fontSize: '0.875rem', // 14px - 按钮文字
      fontWeight: 500,
      lineHeight: 1.75,
      letterSpacing: '0.02857em',
      textTransform: 'none', // 遵循Material Design最佳实践，不转换大小写
    },
  },
  spacing: 8, // 基础间距单位：8px
  shape: {
    borderRadius: 4, // 默认圆角
  },
  // 桌面断点配置
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 900,    // 小桌面
      lg: 1200,   // 标准桌面
      xl: 1536,   // 大屏桌面
    },
  },
  components: {
    // 自定义组件默认样式 - 桌面优化
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8, // 按钮圆角
          textTransform: 'none', // 不转换大小写，符合现代Material Design
          fontWeight: 500,
          minHeight: 36, // 最小高度，适合桌面点击
          padding: '8px 16px', // 标准内边距
          cursor: 'pointer', // 桌面鼠标指针
        },
        contained: {
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          '&:hover': {
            boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
            transform: 'translateY(-1px)', // 轻微上移效果
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12, // 卡片圆角
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          // 桌面悬浮效果
          '&:hover': {
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            transform: 'translateY(-2px)',
            transition: 'all 0.2s ease-in-out',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8, // 输入框圆角
            // 桌面焦点效果
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: 'rgba(25, 118, 210, 0.5)',
            },
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
          boxShadow: '0 2px 1px -1px rgba(0,0,0,0.2), 0 1px 1px 0 rgba(0,0,0,0.14), 0 1px 3px 0 rgba(0,0,0,0.12)',
        },
        elevation2: {
          boxShadow: '0 3px 1px -2px rgba(0,0,0,0.2), 0 2px 2px 0 rgba(0,0,0,0.14), 0 1px 5px 0 rgba(0,0,0,0.12)',
        },
        elevation3: {
          boxShadow: '0 3px 3px -2px rgba(0,0,0,0.2), 0 3px 4px 0 rgba(0,0,0,0.14), 0 1px 8px 0 rgba(0,0,0,0.12)',
        },
        elevation4: {
          boxShadow: '0 2px 4px -1px rgba(0,0,0,0.2), 0 4px 5px 0 rgba(0,0,0,0.14), 0 1px 10px 0 rgba(0,0,0,0.12)',
        },
        elevation8: {
          boxShadow: '0 5px 5px -3px rgba(0,0,0,0.2), 0 8px 10px 1px rgba(0,0,0,0.14), 0 3px 14px 2px rgba(0,0,0,0.12)',
        },
        elevation16: {
          boxShadow: '0 8px 10px -5px rgba(0,0,0,0.2), 0 16px 24px 2px rgba(0,0,0,0.14), 0 6px 30px 5px rgba(0,0,0,0.12)',
        },
        elevation24: {
          boxShadow: '0 11px 15px -7px rgba(0,0,0,0.2), 0 24px 38px 3px rgba(0,0,0,0.14), 0 9px 46px 8px rgba(0,0,0,0.12)',
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
    // 桌面表格优化
    MuiTableCell: {
      styleOverrides: {
        root: {
          padding: '16px', // 桌面表格间距
        },
        head: {
          fontWeight: 500,
          backgroundColor: '#f5f5f5',
        },
      },
    },
    // 桌面列表优化
    MuiListItem: {
      styleOverrides: {
        root: {
          padding: '12px 16px', // 桌面列表间距
          '&:hover': {
            backgroundColor: 'rgba(0, 0, 0, 0.04)',
          },
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