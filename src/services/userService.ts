// API 调用将在此处实现
import { UserCredentials } from '../types/user';

const API_BASE_URL = 'http://localhost:8080'; // 从 OpenAPI 文档中获取

export const registerUser = async (credentials: UserCredentials) => {
  const response = await fetch(`${API_BASE_URL}/users/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  });

  const data = await response.json();

  if (!response.ok) {
    // 后端可能在 data.message 或其他字段中返回错误信息
    throw new Error(data.message || '注册失败');
  }
  // 假设注册成功，后端直接返回 200 OK 和一些对象
  return data; 
};

export const loginUser = async (credentials: UserCredentials) => {
  const response = await fetch(`${API_BASE_URL}/users/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || '登录失败');
  }
  // 假设登录成功，后端返回的数据包含 token 或用户信息
  return data;
};

export const logoutUser = async () => {
  // 根据 OpenAPI 文档，logout 是一个 POST 请求，不需要请求体
  const response = await fetch(`${API_BASE_URL}/users/logout`, {
    method: 'POST',
    headers: {
      // 如果API需要认证token，需要在这里添加，例如：
      // 'Authorization': `Bearer ${localStorage.getItem('token')}`,
      'Content-Type': 'application/json',
    },
  });

  const data = await response.json(); // 即使没有具体内容，也尝试解析，后端可能返回空对象或简单消息

  if (!response.ok) {
    throw new Error(data.message || '登出失败');
  }
  // 登出成功，可以清除本地存储的token等
  // localStorage.removeItem('token'); 
  return data; // 或者可以返回一个表示成功的布尔值 true
}; 