/**
 * 用户管理相关的工具函数
 */

// 默认的测试用户ID
export const DEFAULT_USER_ID = 'test-user-001';
const USER_ID_STORAGE_KEY = 'app_user_id'; // 定义 localStorage 键名

/**
 * 获取当前用户ID
 * 尝试从 localStorage 获取，如果不存在则使用默认ID并存入 localStorage。
 * @returns 用户ID字符串
 */
export const getUserId = (): string => {
  if (typeof window !== 'undefined') {
    let userId = localStorage.getItem(USER_ID_STORAGE_KEY);
    if (userId) {
      return userId;
    }
    // 如果 localStorage 中没有，使用默认ID并存储
    localStorage.setItem(USER_ID_STORAGE_KEY, DEFAULT_USER_ID);
    return DEFAULT_USER_ID;
  }
  // 服务器端渲染或 window 不可用时，返回默认值（或处理错误）
  return DEFAULT_USER_ID;
};

/**
 * 设置用户ID到 localStorage
 * @param userId 要存储的用户ID
 */
export const setUserId = (userId: string): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(USER_ID_STORAGE_KEY, userId);
  }
};

/**
 * 清除 localStorage 中的用户ID
 */
export const clearUserId = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(USER_ID_STORAGE_KEY);
  }
}; 