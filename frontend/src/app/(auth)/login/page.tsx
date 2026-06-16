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

const loginSchema = z.object({
  email: z.string().email('有効なメールアドレスを入力してください'),
  password: z.string().min(1, 'パスワードを入力してください'),
});

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) router.push('/dashboard');
  }, [isAuthenticated, router]);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try { await login(data); } catch { /* エラーはuseAuth内でトースト表示 */ }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-violet-50 dark:from-[#0a0f1e] dark:via-gray-900 dark:to-[#0a0f1e] p-4">
      <div className="w-full max-w-sm">
        {/* ロゴ */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl gradient-bg shadow-lg shadow-primary-200/50 dark:shadow-primary-900/40 mb-4">
            <Target size={26} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">GoalTrack</h1>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">目標達成管理アプリ</p>
        </div>

        {/* フォームカード */}
        <div className="card p-7">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-5">ログイン</h2>

          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-2">
                メールアドレス
              </label>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                  id="email" type="email" autoComplete="email" placeholder="you@example.com"
                  {...register('email')}
                  className="input-base pl-10"
                  aria-invalid={!!errors.email}
                />
              </div>
              {errors.email && <p className="mt-1.5 text-xs text-danger-500" role="alert">{errors.email.message}</p>}
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-2">
                パスワード
              </label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                  id="password" type="password" autoComplete="current-password" placeholder="••••••••"
                  {...register('password')}
                  className="input-base pl-10"
                  aria-invalid={!!errors.password}
                />
              </div>
              {errors.password && <p className="mt-1.5 text-xs text-danger-500" role="alert">{errors.password.message}</p>}
            </div>

            <Button type="submit" className="w-full mt-2" size="lg" isLoading={isLoading}>
              ログイン
            </Button>
          </form>

          <p className="mt-5 text-center text-sm text-gray-400 dark:text-gray-500">
            アカウントをお持ちでない方は{' '}
            <Link href="/register" className="text-primary-600 hover:text-primary-500 font-medium transition-colors">
              新規登録
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
