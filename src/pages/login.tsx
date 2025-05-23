import React, { useState } from 'react';
import { loginUser } from '../services/userService';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { UserCredentials } from '../types/user'; // 导入类型
import { setUserId } from '../utils/user'; // <-- 导入 setUserId

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setLoading(true);

    const credentials: UserCredentials = { username, password };

    try {
      const data = await loginUser(credentials);
      setMessage('登录成功！正在跳转...');
      
      // 假设后端返回的数据结构中包含 userId 或者 user.id
      // 以及 token (虽然 token 处理尚未完全实现)
      if (data && data.token) {
        localStorage.setItem('token', data.token); 
        console.log('Login successful, token stored:', data.token);
      } else {
        console.warn('登录响应中未找到 token。');
      }

      let userIdToSet = null;
      if (data && data.userId) {
        userIdToSet = data.userId;
      } else if (data && data.user && data.user.id) {
        userIdToSet = data.user.id;
      }

      if (userIdToSet) {
        setUserId(userIdToSet); // <-- 登录成功后设置用户ID
        console.log('User ID set:', userIdToSet);
      } else {
        // 如果后端没有返回明确的 userId，可以选择 fallback 或记录警告
        // 为了演示，我们仍然允许跳转，但实际应用中可能需要更严格的处理
        console.warn('登录响应中未找到 userId，将依赖 getUserId 的默认行为或已存在的值。');
      }
      
      setTimeout(() => {
        router.push('/'); 
      }, 1500);
    } catch (error: any) {
      console.error('登录错误:', error);
      setMessage(error.message || '发生错误，请稍后重试。');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center text-gray-700">用户登录</h1>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="username">
              用户名
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
              autoComplete="username"
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
              密码
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
              required
              autoComplete="current-password"
            />
          </div>
          <div className="flex items-center justify-between">
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full disabled:opacity-50"
              disabled={loading}
            >
              {loading ? '登录中...' : '登录'}
            </button>
          </div>
        </form>
        {message && (
          <p className={`mt-4 text-center ${message.includes('成功') ? 'text-green-500' : 'text-red-500'}`}>
            {message}
          </p>
        )}
        <p className="mt-6 text-center text-sm text-gray-600">
          还没有账户?{' '}
          <Link href="/register" className="font-medium text-blue-600 hover:text-blue-500">
            去注册
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage; 