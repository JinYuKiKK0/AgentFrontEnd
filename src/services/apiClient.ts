import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse, AxiosRequestConfig } from 'axios';
import { ApiResponse } from '../types/api';

// API 基础配置
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
const API_TIMEOUT = 30000; // 30秒超时

// 创建 Axios 实例
const apiClient: AxiosInstance = axios.create({
  baseURL: `${API_BASE_URL}/api/Aria`,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // 在这里可以添加认证 token
    // const token = localStorage.getItem('authToken');
    // if (token && config.headers) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    
    console.log('API Request:', config.method?.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    console.error('Request Error:', error);
    return Promise.reject(error);
  }
);

// 响应拦截器
apiClient.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    console.log('API Response:', response.status, response.config.url);
    
    // 检查业务状态码
    if (response.data && response.data.code !== 200) {
      console.warn('Business Error:', response.data.message);
      // 可以在这里处理业务错误
    }
    
    return response;
  },
  (error) => {
    console.error('Response Error:', error);
    
    // 处理不同的HTTP状态码
    if (error.response) {
      const { status, data } = error.response;
      
      switch (status) {
        case 401:
          // 未授权，可能需要重新登录
          console.error('Unauthorized access');
          // 可以在这里触发登录流程
          break;
        case 403:
          // 禁止访问
          console.error('Forbidden access');
          break;
        case 404:
          // 资源不存在
          console.error('Resource not found');
          break;
        case 500:
          // 服务器内部错误
          console.error('Internal server error');
          break;
        default:
          console.error(`HTTP Error ${status}:`, data?.message || error.message);
      }
    } else if (error.request) {
      // 网络错误
      console.error('Network Error:', error.message);
    } else {
      // 其他错误
      console.error('Error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

// 导出 API 客户端
export default apiClient;

// 导出一些常用的请求方法
export const api = {
  get: <T = any>(url: string, config?: AxiosRequestConfig) =>
    apiClient.get<ApiResponse<T>>(url, config),
  
  post: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) =>
    apiClient.post<ApiResponse<T>>(url, data, config),
  
  put: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) =>
    apiClient.put<ApiResponse<T>>(url, data, config),
  
  delete: <T = any>(url: string, config?: AxiosRequestConfig) =>
    apiClient.delete<ApiResponse<T>>(url, config),
  
  patch: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) =>
    apiClient.patch<ApiResponse<T>>(url, data, config),
}; 