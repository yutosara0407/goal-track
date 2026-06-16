'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, Target, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { navItems } from '@/lib/nav';

export function Header() {
  const pathname = usePathname();
  const { logout, user } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const initials = user?.name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) ?? '??';

  return (
    <>
      <header className="sticky top-0 z-40 glass border-b border-gray-100 dark:border-gray-800/60 lg:hidden">
        <div className="flex items-center justify-between px-4 h-14">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg gradient-bg flex items-center justify-center shadow-sm">
              <Target size={13} className="text-white" />
            </div>
            <span className="font-bold text-gray-900 dark:text-white text-sm tracking-tight">GoalTrack</span>
          </div>
          <button
            onClick={() => setIsMobileMenuOpen((v) => !v)}
            className="p-2 rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label={isMobileMenuOpen ? 'メニューを閉じる' : 'メニューを開く'}
          >
            {isMobileMenuOpen ? <X size={19} /> : <Menu size={19} />}
          </button>
        </div>
      </header>

      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-hidden="true"
          />
          <nav className="absolute inset-y-0 left-0 w-64 bg-white dark:bg-gray-900 shadow-2xl flex flex-col animate-slide-in">
            {/* ロゴ */}
            <div className="flex items-center gap-2.5 px-4 py-4 border-b border-gray-100 dark:border-gray-800">
              <div className="w-8 h-8 rounded-xl gradient-bg flex items-center justify-center shadow-sm">
                <Target size={15} className="text-white" />
              </div>
              <span className="font-bold text-gray-900 dark:text-white tracking-tight">GoalTrack</span>
            </div>

            {/* ナビリンク */}
            <div className="flex-1 px-3 py-3 space-y-0.5">
              {navItems.map((item) => {
                const isActive = pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={cn(
                      'flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-primary-50 text-primary-700 dark:bg-primary-500/10 dark:text-primary-400'
                        : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800 dark:text-gray-400 dark:hover:bg-gray-800'
                    )}
                  >
                    <span className={cn(isActive ? 'text-primary-600 dark:text-primary-400' : 'text-gray-400')}>
                      {item.icon}
                    </span>
                    {item.label}
                  </Link>
                );
              })}
            </div>

            {/* ユーザー情報 */}
            <div className="border-t border-gray-100 dark:border-gray-800 px-3 py-3 space-y-0.5">
              <div className="flex items-center gap-2.5 px-3 py-2 mb-1">
                <div className="w-8 h-8 rounded-xl gradient-bg flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xs font-bold">{initials}</span>
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-200 truncate">{user?.name}</p>
                  <p className="text-xs text-gray-400 truncate">{user?.email}</p>
                </div>
              </div>
              <button
                onClick={() => { setIsMobileMenuOpen(false); logout(); }}
                className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-800 dark:text-gray-400 dark:hover:bg-gray-800 transition-colors"
              >
                <LogOut size={17} className="text-gray-400" />
                ログアウト
              </button>
            </div>
          </nav>
        </div>
      )}
    </>
  );
}
