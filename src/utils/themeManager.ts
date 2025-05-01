/**
 * 主题管理工具 - 处理深色/浅色模式切换
 */

// 主题类型
export type Theme = 'light' | 'dark';

// 本地存储的主题键名
const THEME_KEY = 'theme-mode';

/**
 * 获取当前主题
 * @returns 当前主题模式
 */
export const getTheme = (): Theme => {
  // 如果在浏览器环境
  if (typeof window !== 'undefined') {
    // 尝试从本地存储获取主题设置
    const savedTheme = localStorage.getItem(THEME_KEY) as Theme | null;
    
    // 如果有保存的主题设置，返回该设置
    if (savedTheme) {
      return savedTheme;
    }
    
    // 如果没有保存的设置，检查系统偏好
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
  }
  
  // 默认返回浅色模式
  return 'light';
};

/**
 * 设置主题
 * @param theme 要设置的主题
 */
export const setTheme = (theme: Theme): void => {
  if (typeof window !== 'undefined') {
    // 保存到本地存储
    localStorage.setItem(THEME_KEY, theme);
    
    // 更新HTML元素的类
    const htmlElement = document.documentElement;
    
    if (theme === 'dark') {
      htmlElement.classList.add('dark');
    } else {
      htmlElement.classList.remove('dark');
    }
  }
};

/**
 * 切换主题
 * @returns 切换后的主题
 */
export const toggleTheme = (): Theme => {
  const currentTheme = getTheme();
  const newTheme = currentTheme === 'light' ? 'dark' : 'light';
  setTheme(newTheme);
  return newTheme;
};

/**
 * 初始化主题
 * 在应用启动时调用，根据保存的设置或系统偏好设置初始主题
 */
export const initTheme = (): void => {
  const theme = getTheme();
  setTheme(theme);
};