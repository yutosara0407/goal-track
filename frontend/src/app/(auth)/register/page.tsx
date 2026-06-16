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

const registerSchema = z
  .object({
    name: z.string().min(1, '名前を入力してください').max(50, '名前は50文字以内で入力してください'),
    email: z.string().email('有効なメールアドレスを入力してください'),
    password: z.string().min(8, 'パスワードは8文字以上で入力してください').regex(/[A-Za-z]/, '英字を含めてください'),
    password_confirmation: z.string().min(1, 'パスワード（確認）を入力してください'),
  })
  .refine((data) => data.password === data.password_confirmation, {
    path: ['password_confirmation'],
    message: 'パスワードが一致しません',
  });

export default function RegisterPage() {
  const router = useRouter();
  const { register: registerUser, isLoading, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) router.push('/dashboard');
  }, [isAuthenticated, router]);

  const { register, handleSubmit, formState: { errors } } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    try { await registerUser(data); } catch { /* エラーはuseAuth内でトースト表示 */ }
  };

  const fields = [
    { id: 'name',                  label: 'お名前',           type: 'text',     icon: User,  placeholder: '山田 太郎',      autoComplete: 'name' },
    { id: 'email',                 label: 'メールアドレス',   type: 'email',    icon: Mail,  placeholder: 'you@example.com', autoComplete: 'email' },
    { id: 'password',              label: 'パスワード',       type: 'password', icon: Lock,  placeholder: '8文字以上',       autoComplete: 'new-password' },
    { id: 'password_confirmation', label: 'パスワード（確認）', type: 'password', icon: Lock, placeholder: 'もう一度入力',     autoComplete: 'new-password' },
  ] as const;

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
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-5">新規登録</h2>

          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
            {fields.map(({ id, label, type, icon: Icon, placeholder, autoComplete }) => (
              <div key={id}>
                <label htmlFor={id} className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-2">
                  {label}
                </label>
                <div className="relative">
                  <Icon size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  <input
                    id={id} type={type} autoComplete={autoComplete} placeholder={placeholder}
                    {...register(id)}
                    className="input-base pl-10"
                    aria-invalid={!!errors[id]}
                  />
                </div>
                {errors[id] && <p className="mt-1.5 text-xs text-danger-500" role="alert">{errors[id]?.message}</p>}
              </div>
            ))}

            <Button type="submit" className="w-full mt-2" size="lg" isLoading={isLoading}>
              アカウントを作成
            </Button>
          </form>

          <p className="mt-5 text-center text-sm text-gray-400 dark:text-gray-500">
            既にアカウントをお持ちの方は{' '}
            <Link href="/login" className="text-primary-600 hover:text-primary-500 font-medium transition-colors">
              ログイン
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
