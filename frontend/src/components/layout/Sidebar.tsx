/**
 * サイドバーナビゲーション
 * デスクトップ表示時の左サイドバーメニュー
 */
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Target,
  LayoutDashboard,
  ListTodo,
  CalendarDays,
  History,
  LogOut,
  Mail,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { useEmailStatus } from '@/hooks/useEmailStatus';

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  { href: '/dashboard', label: 'ダッシュボード', icon: <LayoutDashboard size={18} /> },
  { href: '/goals',     label: '目標管理',       icon: <ListTodo size={18} /> },
  { href: '/calendar',  label: 'カレンダー',     icon: <CalendarDays size={18} /> },
  { href: '/history',   label: '履歴・分析',     icon: <History size={18} /> },
];

export function Sidebar() {
  const pathname = usePathname();
  const { logout, user } = useAuth();
  const { data: emailStatus } = useEmailStatus();

  return (
    <aside className="hidden lg:flex lg:flex-col w-60 h-screen sticky top-0 border-r border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 px-3 py-4">
      {/* ロゴ */}
      <div className="flex items-center gap-2.5 px-3 mb-6">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary-600">
          <Target size={16} className="text-white" />
        </div>
        <span className="font-bold text-gray-900 dark:text-white text-base">GoalTrack</span>
      </div>

      {/* ナビゲーション */}
      <nav className="flex-1 space-y-0.5">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150',
                isActive
                  ? 'bg-primary-50 text-primary-700 dark:bg-primary-500/10 dark:text-primary-400'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200'
              )}
              aria-current={isActive ? 'page' : undefined}
            >
              <span
                className={cn(
                  isActive ? 'text-primary-600 dark:text-primary-400' : 'text-gray-400 dark:text-gray-500'
                )}
              >
                {item.icon}
              </span>
              {item.label}
              {/* アクティブインジケーター */}
              {isActive && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary-600 dark:bg-primary-400" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* ユーザー情報 & ログアウト */}
      <div className="border-t border-gray-100 dark:border-gray-800 pt-3 mt-3">
        <div className="px-3 py-2 mb-1">
          <p className="text-xs font-medium text-gray-900 dark:text-gray-200 truncate">{user?.name}</p>
          <p className="text-xs text-gray-400 dark:text-gray-500 truncate">{user?.email}</p>
        </div>

        {/* メール送信残数 */}
        {emailStatus && (
          <div className="mx-3 mb-2 px-2.5 py-2 rounded-lg bg-gray-50 dark:bg-gray-800/60">
            <div className="flex items-center gap-1.5 mb-1">
              <Mail size={11} className="text-gray-400 dark:text-gray-500 shrink-0" />
              <span className="text-[10px] text-gray-400 dark:text-gray-500">メール送信</span>
            </div>
            <div className="flex items-baseline justify-between">
              <span className={cn(
                'text-xs font-medium',
                emailStatus.remaining <= 5
                  ? 'text-red-500 dark:text-red-400'
                  : emailStatus.remaining <= 10
                  ? 'text-amber-500 dark:text-amber-400'
                  : 'text-gray-600 dark:text-gray-300'
              )}>
                残り {emailStatus.remaining} 通
              </span>
              <span className="text-[10px] text-gray-400 dark:text-gray-500">
                {new Date(emailStatus.reset_at).getMonth() + 1}月末リセット
              </span>
            </div>
            <div className="mt-1.5 h-1 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
              <div
                className={cn(
                  'h-full rounded-full transition-all',
                  emailStatus.remaining <= 5
                    ? 'bg-red-400'
                    : emailStatus.remaining <= 10
                    ? 'bg-amber-400'
                    : 'bg-primary-500'
                )}
                style={{ width: `${(emailStatus.remaining / emailStatus.limit) * 100}%` }}
              />
            </div>
          </div>
        )}
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200 transition-colors"
        >
          <LogOut size={18} className="text-gray-400" />
          ログアウト
        </button>
      </div>
    </aside>
  );
}
