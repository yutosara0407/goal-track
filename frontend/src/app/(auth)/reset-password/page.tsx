'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Target, Lock, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/Button';
import { authApi } from '@/lib/api';
import { extractErrorMessage } from '@/lib/utils';
import { useLang } from '@/contexts/LangContext';

const resetSchema = z
  .object({
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

type ResetFormValues = z.infer<typeof resetSchema>;

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useLang();
  const [isLoading, setIsLoading] = useState(false);

  const token = searchParams.get('token');
  const email = searchParams.get('email');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetFormValues>({
    resolver: zodResolver(resetSchema),
  });

  const onSubmit = async (data: ResetFormValues) => {
    if (!token || !email) return;
    setIsLoading(true);
    try {
      const res = await authApi.resetPassword({ token, email, ...data });
      toast.success(res.message);
      router.push('/login');
    } catch (error) {
      toast.error(extractErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  // トークンかメールがURLにない場合は無効なリンク
  const isInvalidLink = !token || !email;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl shadow-indigo-100/50 dark:shadow-black/40 border border-slate-100 dark:border-slate-800 p-8">
      <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">{t.auth.resetTitle}</h2>

      {isInvalidLink ? (
        <div className="py-4">
          <p className="text-sm text-slate-600 dark:text-slate-300">{t.auth.resetInvalidLink}</p>
          <p className="mt-4 text-sm">
            <Link href="/forgot-password" className="text-primary-600 hover:text-primary-700 font-medium transition-colors">
              {t.auth.forgotTitle}
            </Link>
          </p>
        </div>
      ) : (
        <>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">{t.auth.resetDesc}</p>

          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
            {/* 新しいパスワード */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                {t.auth.newPasswordLabel}
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  placeholder={t.auth.passwordMin}
                  {...register('password')}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow"
                  aria-invalid={!!errors.password}
                />
              </div>
              {errors.password && (
                <p className="mt-1.5 text-xs text-danger-500" role="alert">{errors.password.message}</p>
              )}
            </div>

            {/* パスワード（確認） */}
            <div>
              <label htmlFor="password_confirmation" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                {t.auth.passwordConfirmLabel}
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  id="password_confirmation"
                  type="password"
                  autoComplete="new-password"
                  placeholder={t.auth.passwordConfirmPlaceholder}
                  {...register('password_confirmation')}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow"
                  aria-invalid={!!errors.password_confirmation}
                />
              </div>
              {errors.password_confirmation && (
                <p className="mt-1.5 text-xs text-danger-500" role="alert">{errors.password_confirmation.message}</p>
              )}
            </div>

            <Button type="submit" className="w-full mt-2" size="lg" isLoading={isLoading}>
              {t.auth.resetButton}
            </Button>
          </form>
        </>
      )}

      <p className="mt-5 text-center text-sm">
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-primary-600 hover:text-primary-700 font-medium transition-colors"
        >
          <ArrowLeft size={14} />
          {t.auth.backToLogin}
        </Link>
      </p>
    </div>
  );
}

export default function ResetPasswordPage() {
  const { t } = useLang();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-slate-50 to-violet-50 dark:from-slate-950 dark:via-indigo-950/30 dark:to-slate-950 p-4">
      <div className="w-full max-w-md">
        {/* ロゴ */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-200/70 dark:shadow-indigo-900/50 mb-4">
            <Target size={28} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent dark:from-indigo-400 dark:to-violet-400">GoalTrack</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">{t.auth.appSubtitle}</p>
        </div>

        {/* useSearchParamsを使うコンポーネントはSuspense境界が必要 */}
        <Suspense fallback={null}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
