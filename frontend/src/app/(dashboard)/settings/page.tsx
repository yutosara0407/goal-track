'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { UserRound, AtSign, Lock, Globe, Rss, TriangleAlert } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { authApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import { extractErrorMessage } from '@/lib/utils';
import { useLang } from '@/contexts/LangContext';

const profileSchema = z.object({
  name: z.string().min(1, '名前を入力してください').max(50, '名前は50文字以内で入力してください'),
  // 未設定は空文字として扱い、送信時にnullへ変換する
  username: z.union([
    z.literal(''),
    z
      .string()
      .max(10, 'ユーザーIDは10文字以内で入力してください')
      .regex(/^[A-Za-z0-9_.-]+$/, 'ユーザーIDは半角英数字・_・.・-のみ使用できます'),
  ]),
  email: z.string().email('有効なメールアドレスを入力してください'),
  bio: z.string().max(500, '自己紹介は500文字以内で入力してください'),
  is_public: z.boolean(),
  share_timeline: z.boolean(),
  share_timeline_notes: z.boolean(),
});

const passwordSchema = z
  .object({
    current_password: z.string().min(1, '現在のパスワードを入力してください'),
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

type ProfileFormValues = z.infer<typeof profileSchema>;
type PasswordFormValues = z.infer<typeof passwordSchema>;

/** 入力欄の共通スタイル */
const inputClass =
  'w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow';

export default function SettingsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { t } = useLang();
  const { user, setUser, logout: storeLogout } = useAuthStore();

  const [isProfileSaving, setIsProfileSaving] = useState(false);
  const [isPasswordSaving, setIsPasswordSaving] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    values: {
      name: user?.name ?? '',
      username: user?.username ?? '',
      email: user?.email ?? '',
      bio: user?.bio ?? '',
      is_public: user?.is_public ?? true,
      share_timeline: user?.share_timeline ?? false,
      share_timeline_notes: user?.share_timeline_notes ?? false,
    },
  });
  const isPublic = profileForm.watch('is_public');
  const shareTimeline = profileForm.watch('share_timeline');
  const shareTimelineNotes = profileForm.watch('share_timeline_notes');

  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
  });

  const onProfileSubmit = async (data: ProfileFormValues) => {
    setIsProfileSaving(true);
    try {
      // 空文字は「未設定」を意味するのでnullとして送る
      const updated = await authApi.updateProfile({ ...data, username: data.username || null });
      setUser(updated);
      toast.success(t.settings.profileSaved);
    } catch (error) {
      toast.error(extractErrorMessage(error));
    } finally {
      setIsProfileSaving(false);
    }
  };

  const onPasswordSubmit = async (data: PasswordFormValues) => {
    setIsPasswordSaving(true);
    try {
      await authApi.updatePassword(data);
      passwordForm.reset({ current_password: '', password: '', password_confirmation: '' });
      toast.success(t.settings.passwordSaved);
    } catch (error) {
      toast.error(extractErrorMessage(error));
    } finally {
      setIsPasswordSaving(false);
    }
  };

  const onDeleteAccount = async () => {
    if (!deletePassword) return;
    setIsDeleting(true);
    try {
      await authApi.deleteAccount(deletePassword);
      queryClient.clear();
      storeLogout();
      toast.success(t.settings.deleted);
      router.push('/');
    } catch (error) {
      toast.error(extractErrorMessage(error));
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* ページヘッダー */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t.settings.title}</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{t.settings.subtitle}</p>
      </div>

      {/* プロフィール */}
      <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm p-6">
        <div className="flex items-center gap-2.5 mb-5">
          <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-900/20">
            <UserRound size={18} className="text-indigo-600 dark:text-indigo-400" />
          </div>
          <h2 className="text-base font-semibold text-slate-900 dark:text-white">{t.settings.profileTitle}</h2>
        </div>

        <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} noValidate className="space-y-4 max-w-md">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              {t.auth.nameLabel}
            </label>
            <input id="name" type="text" autoComplete="name" {...profileForm.register('name')} className={inputClass} />
            {profileForm.formState.errors.name && (
              <p className="mt-1.5 text-xs text-danger-500" role="alert">{profileForm.formState.errors.name.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="username" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              {t.auth.usernameLabel}
            </label>
            <div className="relative">
              <AtSign size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                id="username"
                type="text"
                autoComplete="off"
                maxLength={10}
                placeholder={t.auth.usernamePlaceholder}
                {...profileForm.register('username')}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow"
              />
            </div>
            {profileForm.formState.errors.username ? (
              <p className="mt-1.5 text-xs text-danger-500" role="alert">{profileForm.formState.errors.username.message}</p>
            ) : (
              <p className="mt-1.5 text-xs text-slate-400 dark:text-slate-500">{t.auth.usernameHelp}</p>
            )}
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              {t.auth.emailLabel}
            </label>
            <input id="email" type="email" autoComplete="email" {...profileForm.register('email')} className={inputClass} />
            {profileForm.formState.errors.email && (
              <p className="mt-1.5 text-xs text-danger-500" role="alert">{profileForm.formState.errors.email.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="bio" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              {t.settings.bioLabel}
            </label>
            <textarea
              id="bio"
              rows={3}
              maxLength={500}
              placeholder={t.settings.bioPlaceholder}
              {...profileForm.register('bio')}
              className={`${inputClass} resize-none`}
            />
            {profileForm.formState.errors.bio && (
              <p className="mt-1.5 text-xs text-danger-500" role="alert">{profileForm.formState.errors.bio.message}</p>
            )}
          </div>

          {/* 公開/非公開トグル */}
          <div className="flex items-start justify-between gap-4 p-4 rounded-xl bg-slate-50/70 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
            <div className="min-w-0">
              <p className="flex items-center gap-1.5 text-sm font-medium text-slate-700 dark:text-slate-300">
                {isPublic ? <Globe size={14} className="text-indigo-500" /> : <Lock size={14} className="text-slate-400" />}
                {t.settings.visibilityTitle}
                <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                  {isPublic ? t.settings.visibilityPublic : t.settings.visibilityPrivate}
                </span>
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">{t.settings.visibilityDesc}</p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={isPublic}
              aria-label={t.settings.visibilityTitle}
              onClick={() => profileForm.setValue('is_public', !isPublic, { shouldDirty: true })}
              className={`relative shrink-0 w-11 h-6 rounded-full transition-colors ${
                isPublic ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-600'
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                  isPublic ? 'translate-x-5' : ''
                }`}
              />
            </button>
          </div>

          {/* タイムライン公開トグル（is_publicとは独立した設定） */}
          <div className="flex items-start justify-between gap-4 p-4 rounded-xl bg-slate-50/70 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
            <div className="min-w-0">
              <p className="flex items-center gap-1.5 text-sm font-medium text-slate-700 dark:text-slate-300">
                <Rss size={14} className={shareTimeline ? 'text-indigo-500' : 'text-slate-400'} />
                {t.settings.shareTimelineTitle}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">{t.settings.shareTimelineDesc}</p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={shareTimeline}
              aria-label={t.settings.shareTimelineTitle}
              onClick={() => {
                const next = !shareTimeline;
                profileForm.setValue('share_timeline', next, { shouldDirty: true });
                // 実績公開自体をOFFにする場合は、note公開もあわせてOFFに戻す
                if (!next) profileForm.setValue('share_timeline_notes', false, { shouldDirty: true });
              }}
              className={`relative shrink-0 w-11 h-6 rounded-full transition-colors ${
                shareTimeline ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-600'
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                  shareTimeline ? 'translate-x-5' : ''
                }`}
              />
            </button>
          </div>

          {/* ノートもタイムラインに含めるかのトグル（share_timeline有効時のみ操作可） */}
          <div
            className={`flex items-start justify-between gap-4 p-4 rounded-xl bg-slate-50/70 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 ${
              !shareTimeline ? 'opacity-50' : ''
            }`}
          >
            <div className="min-w-0">
              <p className="flex items-center gap-1.5 text-sm font-medium text-slate-700 dark:text-slate-300">
                {t.settings.shareTimelineNotesTitle}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">{t.settings.shareTimelineNotesDesc}</p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={shareTimelineNotes}
              aria-label={t.settings.shareTimelineNotesTitle}
              disabled={!shareTimeline}
              onClick={() => profileForm.setValue('share_timeline_notes', !shareTimelineNotes, { shouldDirty: true })}
              className={`relative shrink-0 w-11 h-6 rounded-full transition-colors disabled:pointer-events-none ${
                shareTimelineNotes ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-600'
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                  shareTimelineNotes ? 'translate-x-5' : ''
                }`}
              />
            </button>
          </div>

          <Button type="submit" isLoading={isProfileSaving}>{t.settings.profileSave}</Button>
        </form>
      </section>

      {/* パスワード変更 */}
      <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm p-6">
        <div className="flex items-center gap-2.5 mb-5">
          <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-900/20">
            <Lock size={18} className="text-indigo-600 dark:text-indigo-400" />
          </div>
          <h2 className="text-base font-semibold text-slate-900 dark:text-white">{t.settings.passwordTitle}</h2>
        </div>

        <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} noValidate className="space-y-4 max-w-md">
          <div>
            <label htmlFor="current_password" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              {t.settings.currentPasswordLabel}
            </label>
            <input
              id="current_password"
              type="password"
              autoComplete="current-password"
              {...passwordForm.register('current_password')}
              className={inputClass}
            />
            {passwordForm.formState.errors.current_password && (
              <p className="mt-1.5 text-xs text-danger-500" role="alert">{passwordForm.formState.errors.current_password.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="new_password" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              {t.settings.newPasswordLabel}
            </label>
            <input
              id="new_password"
              type="password"
              autoComplete="new-password"
              placeholder={t.auth.passwordMin}
              {...passwordForm.register('password')}
              className={inputClass}
            />
            {passwordForm.formState.errors.password && (
              <p className="mt-1.5 text-xs text-danger-500" role="alert">{passwordForm.formState.errors.password.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="new_password_confirmation" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              {t.settings.newPasswordConfirmLabel}
            </label>
            <input
              id="new_password_confirmation"
              type="password"
              autoComplete="new-password"
              {...passwordForm.register('password_confirmation')}
              className={inputClass}
            />
            {passwordForm.formState.errors.password_confirmation && (
              <p className="mt-1.5 text-xs text-danger-500" role="alert">{passwordForm.formState.errors.password_confirmation.message}</p>
            )}
          </div>

          <Button type="submit" isLoading={isPasswordSaving}>{t.settings.passwordSave}</Button>
        </form>
      </section>

      {/* 退会（危険操作） */}
      <section className="bg-white dark:bg-slate-900 rounded-2xl border border-red-200 dark:border-red-900/50 shadow-sm p-6">
        <div className="flex items-center gap-2.5 mb-3">
          <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-danger-50 dark:bg-red-900/20">
            <TriangleAlert size={18} className="text-danger-500" />
          </div>
          <h2 className="text-base font-semibold text-slate-900 dark:text-white">{t.settings.dangerTitle}</h2>
        </div>

        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 max-w-lg">{t.settings.dangerDesc}</p>

        <Button variant="danger" onClick={() => setIsDeleteModalOpen(true)}>
          {t.settings.deleteButton}
        </Button>
      </section>

      {/* 削除確認モーダル */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeletePassword('');
        }}
        title={t.settings.deleteModalTitle}
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600 dark:text-slate-300">{t.settings.deleteModalDesc}</p>

          <input
            type="password"
            autoComplete="current-password"
            placeholder={t.auth.passwordLabel}
            value={deletePassword}
            onChange={(e) => setDeletePassword(e.target.value)}
            className={inputClass}
          />

          <div className="flex justify-end gap-2">
            <Button
              variant="ghost"
              onClick={() => {
                setIsDeleteModalOpen(false);
                setDeletePassword('');
              }}
            >
              {t.common.cancel}
            </Button>
            <Button variant="danger" onClick={onDeleteAccount} isLoading={isDeleting} disabled={!deletePassword}>
              {t.settings.deleteConfirm}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
