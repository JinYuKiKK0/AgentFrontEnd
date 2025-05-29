import { api } from '../../../services/apiClient';
import { ApiResponse } from '../../../types/api'; // Assuming this is the correct path
import { LoginDTO, RegisterDTO, LoginResponse } from '../types/authApi';

export class AuthService {
  /**
   * 用户登录
   */
  static async login(credentials: LoginDTO): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>('/auth/login', credentials);
    // Assuming a successful login (code 200) will have the LoginResponse in response.data.data
    if (response.data.code === 200 && response.data.data) {
      return response.data.data;
    } else {
      // Throw an error with the message from the API, or a default error message
      throw new Error(response.data.message || 'Login failed');
    }
  }

  /**
   * 用户注册
   */
  static async register(userInfo: RegisterDTO): Promise<void> {
    // The swagger doc suggests the response is Result (a generic DTO)
    // For register, we might not need specific data back other than success/failure.
    // The API_for_Frontend says: "响应: 统一响应结构，`data`中包含成功提示。"
    // We'll assume no specific data object is expected for the Promise<void> return type.
    const response = await api.post<any>('/auth/register', userInfo);
    if (response.data.code !== 200) {
      throw new Error(response.data.message || 'Registration failed');
    }
    // No specific data to return for void
  }
}

export default AuthService; 