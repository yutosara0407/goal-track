'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Target, Mail, ArrowLeft, MailCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/Button';
import { authApi } from '@/lib/api';
import { ForgotPasswordFormData } from '@/types';
import { extractErrorMessage } from '@/lib/utils';
import { useLang } from '@/contexts/LangContext';

const forgotSchema = z.object({
  email: z.string().email('有効なメールアドレスを入力してください'),
});

export default function ForgotPasswordPage() {
  const { t } = useLang();
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true);
    try {
      await authApi.forgotPassword(data);
      setIsSent(true);
    } catch (error) {
      toast.error(extractErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

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

        {/* フォームカード */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl shadow-indigo-100/50 dark:shadow-black/40 border border-slate-100 dark:border-slate-800 p-8">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">{t.auth.forgotTitle}</h2>

          {isSent ? (
            /* 送信完了メッセージ */
            <div className="text-center py-6">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 mb-4">
                <MailCheck size={26} className="text-emerald-500" />
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-300">{t.auth.resetEmailSent}</p>
            </div>
          ) : (
            <>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">{t.auth.forgotDesc}</p>

              <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    {t.auth.emailLabel}
                  </label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      id="email"
                      type="email"
                      autoComplete="email"
                      placeholder={t.auth.emailPlaceholder}
                      {...register('email')}
                      className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow"
                      aria-invalid={!!errors.email}
                    />
                  </div>
                  {errors.email && (
                    <p className="mt-1.5 text-xs text-danger-500" role="alert">{errors.email.message}</p>
                  )}
                </div>

                <Button type="submit" className="w-full mt-2" size="lg" isLoading={isLoading}>
                  {t.auth.sendResetLink}
                </Button>
              </form>
            </>
          )}

          {/* ログインへ戻る */}
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
      </div>
    </div>
  );
}
