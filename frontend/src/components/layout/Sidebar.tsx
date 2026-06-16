'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Target, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { navItems } from '@/lib/nav';

export function Sidebar() {
  const pathname = usePathname();
  const { logout, user } = useAuth();

  const initials = user?.name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) ?? '??';

  return (
    <aside className="hidden lg:flex lg:flex-col w-60 h-screen sticky top-0 border-r border-gray-100 dark:border-gray-800/60 bg-white dark:bg-gray-900/80 px-3 py-5">
      {/* ロゴ */}
      <div className="flex items-center gap-2.5 px-3 mb-7">
        <div className="flex items-center justify-center w-8 h-8 rounded-xl gradient-bg shadow-md shadow-primary-200/50 dark:shadow-primary-900/40">
          <Target size={15} className="text-white" />
        </div>
        <span className="font-bold text-gray-900 dark:text-white tracking-tight">GoalTrack</span>
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
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800 dark:text-gray-400 dark:hover:bg-gray-800/70 dark:hover:text-gray-200'
              )}
              aria-current={isActive ? 'page' : undefined}
            >
              <span className={cn('transition-colors', isActive ? 'text-primary-600 dark:text-primary-400' : 'text-gray-400 dark:text-gray-500')}>
                {item.icon}
              </span>
              {item.label}
              {isActive && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary-500 dark:bg-primary-400" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* ユーザー情報 */}
      <div className="border-t border-gray-100 dark:border-gray-800/60 pt-3 mt-3 space-y-0.5">
        <div className="flex items-center gap-2.5 px-3 py-2 mb-1">
          <div className="w-7 h-7 rounded-lg gradient-bg flex items-center justify-center flex-shrink-0">
            <span className="text-white text-xs font-bold">{initials}</span>
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-gray-900 dark:text-gray-200 truncate">{user?.name}</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-800 dark:text-gray-400 dark:hover:bg-gray-800/70 dark:hover:text-gray-200 transition-colors"
        >
          <LogOut size={16} className="text-gray-400" />
          ログアウト
        </button>
      </div>
    </aside>
  );
}
