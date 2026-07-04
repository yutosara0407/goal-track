'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, Target, LayoutDashboard, ListTodo, CalendarDays, History, Settings, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { useLang } from '@/contexts/LangContext';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { LangToggle } from '@/components/ui/LangToggle';

export function Header() {
  const pathname = usePathname();
  const { logout, user } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { t } = useLang();

  const navItems = [
    { href: '/dashboard', label: t.nav.dashboard, icon: <LayoutDashboard size={20} /> },
    { href: '/goals',     label: t.nav.goals,     icon: <ListTodo size={20} /> },
    { href: '/calendar',  label: t.nav.calendar,  icon: <CalendarDays size={20} /> },
    { href: '/history',   label: t.nav.history,   icon: <History size={20} /> },
    { href: '/settings',  label: t.nav.settings,  icon: <Settings size={20} /> },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/60 dark:border-slate-700/60 lg:hidden">
        <div className="flex items-center justify-between px-4 h-14">
          {/* ロゴ（モバイル） */}
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 shadow-md shadow-indigo-200/60 dark:shadow-indigo-900/40 flex items-center justify-center">
              <Target size={14} className="text-white" />
            </div>
            <span className="font-bold text-sm bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">GoalTrack</span>
          </div>

          {/* 言語・テーマ + ハンバーガーメニュー */}
          <div className="flex items-center gap-1">
            <LangToggle />
            <ThemeToggle />
            <button
              onClick={() => setIsMobileMenuOpen((v) => !v)}
              className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label={isMobileMenuOpen ? 'メニューを閉じる' : 'メニューを開く'}
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </header>

      {/* モバイルドロワーメニュー */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* オーバーレイ */}
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-hidden="true"
          />

          {/* メニュー本体（左スライドイン） */}
          <nav className="absolute inset-y-0 left-0 w-64 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shadow-xl flex flex-col animate-slide-up">
            {/* ロゴ */}
            <div className="flex items-center gap-2.5 px-4 py-4 border-b border-slate-100 dark:border-slate-800">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 shadow-md shadow-indigo-200/60 dark:shadow-indigo-900/40 flex items-center justify-center">
                <Target size={16} className="text-white" />
              </div>
              <span className="font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">GoalTrack</span>
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
                        ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400 font-semibold'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/60'
                    )}
                  >
                    <span className={cn(isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400')}>
                      {item.icon}
                    </span>
                    {item.label}
                  </Link>
                );
              })}
            </div>

            {/* ユーザー情報 & ログアウト */}
            <div className="border-t border-slate-100 dark:border-slate-800 px-3 py-3">
              <div className="px-3 py-2 mb-1">
                <p className="text-sm font-medium text-slate-900 dark:text-slate-200 truncate">{user?.name}</p>
                <p className="text-xs text-slate-400 truncate">{user?.email}</p>
              </div>

              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  logout();
                }}
                className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/60 transition-colors"
              >
                <LogOut size={18} className="text-slate-400" />
                {t.nav.logout}
              </button>
            </div>
          </nav>
        </div>
      )}
    </>
  );
}
