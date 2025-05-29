// Based on API_for_Frontend and default_OpenAPI (1).json

/**
 * 用户登录数据传输对象
 */
export interface LoginDTO {
  email: string;    // 用户邮箱
  password: string; // 密码 (长度6-20)
}

/**
 * 用户注册数据传输对象
 */
export interface RegisterDTO {
  email: string;    // 用户邮箱
  username: string; // 用户名 (长度4-20)
  password: string; // 密码 (长度6-20)
}

/**
 * 用户登录成功后返回的视图对象
 * Matching LoginVO from default_OpenAPI (1).json
 */
export interface LoginResponse {
  userId: number; // Changed from Long to number for TypeScript
  email: string;
  username: string;
} 