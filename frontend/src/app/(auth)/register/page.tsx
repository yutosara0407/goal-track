/**
 * 新規登録ページ
 * 名前・メール・パスワードによるアカウント作成フォーム
 */
'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Target, User, Mail, Lock } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import { RegisterFormData } from '@/types';

// バリデーションスキーマ
const registerSchema = z
  .object({
    name: z
      .string()
      .min(1, '名前を入力してください')
      .max(50, '名前は50文字以内で入力してください'),
    email: z.string().email('有効なメールアドレスを入力してください'),
    password: z
      .string()
      .min(8, 'パスワードは8文字以上で入力してください')
      .regex(/[A-Za-z]/, 'パスワードには英字を含めてください'),
    password_confirmation: z.string().min(1, 'パスワード（確認）を入力してください'),
  })
  .refine((data) => data.password === data.password_confirmation, {
    path: ['password_confirmation'],
    message: 'パスワードが一致しません',
  });

export default function RegisterPage() {
  const router = useRouter();
  const { register: registerUser, isLoading, isAuthenticated, isInitialized } = useAuth();

  useEffect(() => {
    if (isInitialized && isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, isInitialized, router]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      await registerUser(data);
    } catch {
      // エラーはuseAuth内でトーストに表示
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
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">新規登録</h2>

          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
            {/* 名前 */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                お名前
              </label>
              <div className="relative">
                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  id="name"
                  type="text"
                  autoComplete="name"
                  placeholder="山田 太郎"
                  {...register('name')}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-shadow"
                  aria-invalid={!!errors.name}
                />
              </div>
              {errors.name && (
                <p className="mt-1.5 text-xs text-danger-500" role="alert">{errors.name.message}</p>
              )}
            </div>

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
                  autoComplete="new-password"
                  placeholder="8文字以上"
                  {...register('password')}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-shadow"
                  aria-invalid={!!errors.password}
                />
              </div>
              {errors.password && (
                <p className="mt-1.5 text-xs text-danger-500" role="alert">{errors.password.message}</p>
              )}
            </div>

            {/* パスワード確認 */}
            <div>
              <label htmlFor="password_confirmation" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                パスワード（確認）
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  id="password_confirmation"
                  type="password"
                  autoComplete="new-password"
                  placeholder="もう一度入力"
                  {...register('password_confirmation')}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-shadow"
                  aria-invalid={!!errors.password_confirmation}
                />
              </div>
              {errors.password_confirmation && (
                <p className="mt-1.5 text-xs text-danger-500" role="alert">
                  {errors.password_confirmation.message}
                </p>
              )}
            </div>

            {/* 登録ボタン */}
            <Button
              type="submit"
              className="w-full mt-2"
              size="lg"
              isLoading={isLoading}
            >
              アカウントを作成
            </Button>
          </form>

          {/* ログインリンク */}
          <p className="mt-5 text-center text-sm text-gray-500 dark:text-gray-400">
            既にアカウントをお持ちの方は{' '}
            <Link
              href="/login"
              className="text-primary-600 hover:text-primary-700 font-medium transition-colors"
            >
              ログイン
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
