import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AuthService from '../services/authService';
import { LoginDTO, RegisterDTO, LoginResponse } from '../types/authApi';

interface AuthState {
  isAuthenticated: boolean;
  user: LoginResponse | null;
  isLoading: boolean;
  error: string | null;
  login: (credentials: LoginDTO, navigate: (path: string) => void) => Promise<void>;
  register: (userInfo: RegisterDTO, navigate: (path: string) => void) => Promise<void>;
  logout: (navigate: (path: string) => void) => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      user: null,
      isLoading: false,
      error: null,

      login: async (credentials, navigate) => {
        set({ isLoading: true, error: null });
        try {
          const userData = await AuthService.login(credentials);
          set({ isAuthenticated: true, user: userData, isLoading: false });
          navigate('/chat'); // 导航到聊天页面
        } catch (err: any) {
          set({ error: err.message || 'Login failed', isLoading: false });
        }
      },

      register: async (userInfo, navigate) => {
        set({ isLoading: true, error: null });
        try {
          await AuthService.register(userInfo);
          set({ isLoading: false });
          navigate('/login'); // 注册成功后导航到登录页面
        } catch (err: any) {
          set({ error: err.message || 'Registration failed', isLoading: false });
        }
      },

      logout: (navigate) => {
        set({ isAuthenticated: false, user: null, isLoading: false, error: null });
        // Potentially clear other persisted storage if needed
        navigate('/login'); // 登出后导航到登录页面
      },
      
      clearError: () => {
        set({ error: null });
      }
    }),
    {
      name: 'auth-storage', // unique name
      storage: createJSONStorage(() => localStorage), // (optional) by default, 'localStorage' is used
      partialize: (state) => ({ isAuthenticated: state.isAuthenticated, user: state.user }), // Persist only these fields
    }
  )
); 