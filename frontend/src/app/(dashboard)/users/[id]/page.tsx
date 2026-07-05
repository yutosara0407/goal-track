'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowLeft,
  CalendarDays,
  Flame,
  Lock,
  Target,
  CircleCheck,
  TrendingUp,
  Award,
  LucideIcon,
} from 'lucide-react';
import { usersApi } from '@/lib/api';
import { useLang } from '@/contexts/LangContext';
import { UserAvatar } from '@/components/social/UserCard';
import { FollowButton } from '@/components/social/FollowButton';
import { AchievementBadge } from '@/components/social/AchievementBadge';
import { Badge } from '@/components/ui/Badge';

/** 統計1項目のタイル */
function StatTile({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm p-4">
      <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500 mb-1.5">
        <Icon size={14} />
        <span className="text-xs font-medium">{label}</span>
      </div>
      <p className="text-xl font-bold text-slate-900 dark:text-white">{value}</p>
    </div>
  );
}

export default function UserProfilePage({ params }: { params: { id: string } }) {
  const { id } = params;
  const { t } = useLang();

  const { data: profile, isLoading } = useQuery({
    queryKey: ['users', 'profile', Number(id)],
    queryFn: () => usersApi.profile(Number(id)),
  });

  if (isLoading || !profile) {
    return (
      <div className="space-y-4 max-w-3xl">
        <div className="h-36 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 animate-pulse" />
        <div className="h-24 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 animate-pulse" />
      </div>
    );
  }

  const isVisible = profile.stats !== null;

  return (
    <div className="space-y-6 max-w-3xl">
      <Link
        href="/users"
        className="inline-flex items-center gap-1.5 text-sm text-primary-600 hover:text-primary-700 font-medium transition-colors"
      >
        <ArrowLeft size={14} />
        {t.social.title}
      </Link>

      {/* プロフィールヘッダー */}
      <section className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm p-6">
        <div className="flex items-start gap-4">
          <UserAvatar name={profile.name} size="lg" />

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold text-slate-900 dark:text-white truncate">{profile.name}</h1>
              {profile.is_self && <Badge variant="info">{t.social.yourProfile}</Badge>}
              {!profile.is_public && <Badge variant="neutral">{t.social.privateBadge}</Badge>}
            </div>

            <p className="text-sm text-slate-400 dark:text-slate-500">
              {profile.username ? `@${profile.username}` : t.social.noUsername}
            </p>

            <p className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500 mt-1">
              <CalendarDays size={12} />
              {t.social.joined(profile.joined_at)}
            </p>

            {isVisible && (
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5">
                {t.social.followersCount(profile.followers_count ?? 0)}
                <span className="mx-1.5 text-slate-300 dark:text-slate-600">/</span>
                {t.social.followingCount(profile.following_count ?? 0)}
              </p>
            )}
          </div>

          {!profile.is_self && profile.is_public && (
            <FollowButton userId={profile.id} isFollowing={profile.is_following} />
          )}
        </div>

        {isVisible && (
          <p className="text-sm text-slate-600 dark:text-slate-300 mt-4 whitespace-pre-wrap leading-relaxed">
            {profile.bio || <span className="text-slate-400 dark:text-slate-500">{t.social.noBio}</span>}
          </p>
        )}
      </section>

      {!isVisible ? (
        /* 非公開アカウント */
        <section className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm p-10 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-slate-50 dark:bg-slate-800 mb-4">
            <Lock size={24} className="text-slate-400" />
          </div>
          <p className="font-medium text-slate-700 dark:text-slate-300">{t.social.privateTitle}</p>
          <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">{t.social.privateDesc}</p>
        </section>
      ) : (
        <>
          {/* 達成統計 */}
          <section>
            <h2 className="flex items-center gap-2 text-base font-semibold text-slate-900 dark:text-white mb-3">
              <TrendingUp size={18} className="text-indigo-600 dark:text-indigo-400" />
              {t.social.statsTitle}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              <StatTile icon={Target} label={t.social.statActiveGoals} value={String(profile.stats!.active_goals)} />
              <StatTile icon={CircleCheck} label={t.social.statTotalCompleted} value={String(profile.stats!.total_completed)} />
              <StatTile icon={CalendarDays} label={t.social.statActiveDays} value={String(profile.stats!.active_days)} />
              <StatTile icon={Flame} label={t.social.statBestStreak} value={`${profile.stats!.best_current_streak}${t.streak.days}`} />
              <StatTile icon={TrendingUp} label={t.social.statMonthRate} value={`${Math.round(profile.stats!.month_completion_rate * 100)}%`} />
            </div>
          </section>

          {/* 実績バッジ */}
          <section>
            <h2 className="flex items-center gap-2 text-base font-semibold text-slate-900 dark:text-white mb-3">
              <Award size={18} className="text-indigo-600 dark:text-indigo-400" />
              {t.social.achievementsTitle}
            </h2>
            {profile.achievements && profile.achievements.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {profile.achievements.map((id) => (
                  <AchievementBadge key={id} id={id} />
                ))}
              </div>
            ) : (
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm p-6 text-center">
                <p className="text-sm text-slate-400 dark:text-slate-500">{t.social.noAchievements}</p>
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
