/**
 * 実績バッジ
 * バックエンドが返す実績IDをアイコン+ラベルで表示する
 */
'use client';

import {
  Footprints,
  CircleCheck,
  Medal,
  Trophy,
  Crown,
  Flame,
  Zap,
  Award,
  Sparkles,
  Target,
  Compass,
  LucideIcon,
} from 'lucide-react';
import { useLang } from '@/contexts/LangContext';

/** 実績ID → アイコンと配色の対応表 */
const BADGE_STYLES: Record<string, { icon: LucideIcon; color: string }> = {
  first_step:        { icon: Footprints,  color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20' },
  committed_10:      { icon: CircleCheck, color: 'text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-900/20' },
  dedicated_50:      { icon: Medal,       color: 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20' },
  centurion_100:     { icon: Trophy,      color: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20' },
  legend_365:        { icon: Crown,       color: 'text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-900/20' },
  streak_3:          { icon: Flame,       color: 'text-orange-500 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20' },
  streak_7:          { icon: Flame,       color: 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20' },
  streak_14:         { icon: Zap,         color: 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20' },
  streak_30:         { icon: Award,       color: 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/20' },
  streak_100:        { icon: Sparkles,    color: 'text-fuchsia-600 dark:text-fuchsia-400 bg-fuchsia-50 dark:bg-fuchsia-900/20' },
  goal_setter_3:     { icon: Target,      color: 'text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/20' },
  goal_architect_10: { icon: Compass,     color: 'text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-900/20' },
};

export function AchievementBadge({ id }: { id: string }) {
  const { t } = useLang();
  const style = BADGE_STYLES[id];
  if (!style) return null;

  const Icon = style.icon;
  const label = (t.achievements as Record<string, string>)[id] ?? id;

  return (
    <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold ${style.color}`}>
      <Icon size={14} />
      {label}
    </div>
  );
}
