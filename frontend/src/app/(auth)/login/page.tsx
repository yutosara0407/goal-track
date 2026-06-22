/**
 * ログインページ
 * メール・パスワードによる認証フォームを提供する
 */
'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Target, Mail, Lock } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import { LoginFormData } from '@/types';

// フォームバリデーションスキーマ（Zod）
const loginSchema = z.object({
  email: z.string().email('有効なメールアドレスを入力してください'),
  password: z.string().min(1, 'パスワードを入力してください'),
});

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading, isAuthenticated, isInitialized } = useAuth();

  // 初期化完了後、認証済みの場合はダッシュボードへリダイレクト
  // isInitialized のガードにより、localStorage復元直後の誤リダイレクトを防ぐ
  useEffect(() => {
    if (isInitialized && isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, isInitialized, router]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      await login(data);
    } catch {
      // エラーはuseAuth内でトーストに表示されるため、ここでは何もしない
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-violet-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 p-4">
      <div className="w-full max-w-md">
        {/* ロゴ */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary-600 shadow-lg shadow-primary-200 mb-4">
            <Target size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">GoalTrack</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">目標達成管理アプリ</p>
        </div>

        {/* フォームカード */}
        <div className="card p-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">ログイン</h2>

          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
            {/* メールアドレス */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                メールアドレス
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  {...register('email')}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-shadow"
                  aria-invalid={!!errors.email}
                />
              </div>
              {errors.email && (
                <p className="mt-1.5 text-xs text-danger-500" role="alert">{errors.email.message}</p>
              )}
            </div>

            {/* パスワード */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                パスワード
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="••••••••"
                  {...register('password')}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-shadow"
                  aria-invalid={!!errors.password}
                />
              </div>
              {errors.password && (
                <p className="mt-1.5 text-xs text-danger-500" role="alert">{errors.password.message}</p>
              )}
            </div>

            {/* ログインボタン */}
            <Button
              type="submit"
              className="w-full mt-2"
              size="lg"
              isLoading={isLoading}
            >
              ログイン
            </Button>
          </form>

          {/* 登録リンク */}
          <p className="mt-5 text-center text-sm text-gray-500 dark:text-gray-400">
            アカウントをお持ちでない方は{' '}
            <Link
              href="/register"
              className="text-primary-600 hover:text-primary-700 font-medium transition-colors"
            >
              新規登録
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
