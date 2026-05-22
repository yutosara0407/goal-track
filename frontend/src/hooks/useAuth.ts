/**
 * 認証カスタムフック
 * ログイン・ログアウト・登録処理のロジックをカプセル化する
 */
'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { authApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import { LoginFormData, RegisterFormData } from '@/types';
import { extractErrorMessage } from '@/lib/utils';

export function useAuth() {
  const router = useRouter();
  const { login: storeLogin, logout: storeLogout, user, isAuthenticated } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);

  /**
   * ログイン処理
   * 成功時はダッシュボードにリダイレクト
   */
  const login = async (data: LoginFormData): Promise<void> => {
    setIsLoading(true);
    try {
      const response = await authApi.login(data);
      storeLogin(response.user, response.token);
      toast.success(`おかえりなさい、${response.user.name}さん！`);
      router.push('/dashboard');
    } catch (error) {
      toast.error(extractErrorMessage(error));
      throw error; // フォーム側でもエラーをハンドリングできるように再スロー
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 新規登録処理
   * 成功時はダッシュボードにリダイレクト
   */
  const register = async (data: RegisterFormData): Promise<void> => {
    setIsLoading(true);
    try {
      const response = await authApi.register(data);
      storeLogin(response.user, response.token);
      toast.success('アカウントを作成しました！目標を登録してみましょう 🎯');
      router.push('/dashboard');
    } catch (error) {
      toast.error(extractErrorMessage(error));
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * ログアウト処理
   * APIにログアウトリクエストを送信後、ストアをクリアしてログイン画面へ
   */
  const logout = async (): Promise<void> => {
    try {
      await authApi.logout();
    } catch {
      // ネットワークエラーでもローカルのトークンはクリアする
    } finally {
      storeLogout();
      router.push('/login');
      toast.success('ログアウトしました');
    }
  };

  return {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
  };
}
