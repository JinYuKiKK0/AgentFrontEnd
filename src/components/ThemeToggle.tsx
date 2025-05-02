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
      onClick={handleToggleTheme} // 使用 handleToggleTheme 来更新状态
      className={`p-2 rounded-md text-[rgb(var(--foreground-rgb))] hover:bg-[rgba(var(--foreground-rgb),0.1)] transition-colors duration-200 focus:outline-none ${className}`}
      aria-label={currentTheme === 'dark' ? '切换到浅色模式' : '切换到深色模式'} // 使用 currentTheme
    >
      {currentTheme === 'dark' ? ( // 使用 currentTheme
        <SunIcon className="h-5 w-5" />
      ) : (
        <MoonIcon className="h-5 w-5" />
      )}
    </button>
  );
};

export default ThemeToggle;