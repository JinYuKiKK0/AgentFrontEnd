/**
 * 会话管理工具
 * 用于生成和管理聊天会话ID
 */

const ACTIVE_CONVERSATION_ID_KEY = 'activeChatConversationId';

/**
 * 从localStorage获取当前活动的会话ID
 * @returns 活动会话ID，如果不存在则返回null
 */
export const getActiveConversationIdFromStorage = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(ACTIVE_CONVERSATION_ID_KEY);
  }
  return null;
};

/**
 * 将当前活动的会话ID存储到localStorage
 * @param conversationId 要存储的会话ID
 */
export const setActiveConversationIdInStorage = (conversationId: string): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(ACTIVE_CONVERSATION_ID_KEY, conversationId);
  }
};

/**
 * 从localStorage中清除当前活动的会话ID
 */
export const clearActiveConversationIdFromStorage = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(ACTIVE_CONVERSATION_ID_KEY);
  }
};

/**
 * 生成本地唯一的ID（例如，用于消息的临时ID）
 * @returns 生成的本地ID字符串
 */
export const generateLocalId = (): string => {
  // 生成一个随机的会话ID，格式为：时间戳-随机字符串
  const timestamp = Date.now();
  const randomStr = Math.random().toString(36).substring(2, 10);
  return `local-${timestamp}-${randomStr}`;
};

/**
 * 生成随机会话ID
 * @returns 生成的会话ID
 */
export const generateSessionId = (): string => {
  // 生成一个随机的会话ID，格式为：时间戳-随机字符串
  const timestamp = Date.now();
  const randomStr = Math.random().toString(36).substring(2, 10);
  return `${timestamp}-${randomStr}`;
};

/**
 * 获取当前会话ID，如果不存在则创建新的
 * @returns 当前会话ID
 */
export const getSessionId = (): string => {
  // 从localStorage获取会话ID
  const storedSessionId = localStorage.getItem('chatSessionId');
  
  // 如果存在会话ID，直接返回
  if (storedSessionId) {
    return storedSessionId;
  }
  
  // 如果不存在，生成新的会话ID并存储
  const newSessionId = generateSessionId();
  localStorage.setItem('chatSessionId', newSessionId);
  return newSessionId;
};

/**
 * 重置会话ID
 * @returns 新的会话ID
 */
export const resetSessionId = (): string => {
  // 生成新的会话ID
  const newSessionId = generateSessionId();
  // 存储到localStorage
  localStorage.setItem('chatSessionId', newSessionId);
  return newSessionId;
};