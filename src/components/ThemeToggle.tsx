import React, { useEffect, useState } from 'react';
import { MoonIcon, SunIcon } from '@heroicons/react/24/outline';
import { getTheme, setTheme, toggleTheme, Theme } from '@/utils/themeManager';

/**
 * 主题切换按钮组件属性
 */
interface ThemeToggleProps {
  className?: string;
}

/**
 * 主题切换按钮组件 - 用于切换深色/浅色模式
 * @param className 额外的CSS类名
 */
const ThemeToggle: React.FC<ThemeToggleProps> = ({ className = '' }) => {
  // 当前主题状态
  const [currentTheme, setCurrentTheme] = useState<Theme>('light');

  // 初始化主题
  useEffect(() => {
    // 获取当前主题
    const theme = getTheme();
    setCurrentTheme(theme);
    // 应用主题
    setTheme(theme);
  }, []);

  /**
   * 处理主题切换
   */
  const handleToggleTheme = () => {
    const newTheme = toggleTheme();
    setCurrentTheme(newTheme);
  };

  return (
    <button
      onClick={handleToggleTheme}
      className={`theme-toggle-btn ${className}`}
      aria-label={currentTheme === 'light' ? '切换到深色模式' : '切换到浅色模式'}
      title={currentTheme === 'light' ? '切换到深色模式' : '切换到浅色模式'}
    >
      {currentTheme === 'light' ? (
        <MoonIcon className="h-5 w-5" />
      ) : (
        <SunIcon className="h-5 w-5" />
      )}
    </button>
  );
};

export default ThemeToggle;