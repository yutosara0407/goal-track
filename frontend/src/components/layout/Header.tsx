/**
 * ヘッダーコンポーネント
 * モバイル時のナビゲーションバー兼デスクトップのページタイトルエリア
 */
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, Target, LayoutDashboard, ListTodo, CalendarDays, History, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  { href: '/dashboard', label: 'ダッシュボード', icon: <LayoutDashboard size={20} /> },
  { href: '/goals',     label: '目標管理',       icon: <ListTodo size={20} /> },
  { href: '/calendar',  label: 'カレンダー',     icon: <CalendarDays size={20} /> },
  { href: '/history',   label: '履歴・分析',     icon: <History size={20} /> },
];

export function Header() {
  const pathname = usePathname();
  const { logout, user } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // 現在のページ名を取得
  const currentPage = navItems.find((item) => pathname.startsWith(item.href));

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 lg:hidden">
        <div className="flex items-center justify-between px-4 h-14">
          {/* ロゴ（モバイル） */}
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary-600 flex items-center justify-center">
              <Target size={14} className="text-white" />
            </div>
            <span className="font-bold text-gray-900 dark:text-white text-sm">GoalTrack</span>
          </div>

          {/* ハンバーガーメニューボタン */}
          <button
            onClick={() => setIsMobileMenuOpen((v) => !v)}
            className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label={isMobileMenuOpen ? 'メニューを閉じる' : 'メニューを開く'}
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
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
          <nav className="absolute inset-y-0 left-0 w-64 bg-white dark:bg-gray-900 shadow-xl flex flex-col animate-slide-up">
            {/* ロゴ */}
            <div className="flex items-center gap-2.5 px-4 py-4 border-b border-gray-100 dark:border-gray-800">
              <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center">
                <Target size={16} className="text-white" />
              </div>
              <span className="font-bold text-gray-900 dark:text-white">GoalTrack</span>
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
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800'
                    )}
                  >
                    <span className={cn(isActive ? 'text-primary-600' : 'text-gray-400')}>
                      {item.icon}
                    </span>
                    {item.label}
                  </Link>
                );
              })}
            </div>

            {/* ユーザー情報 & ログアウト */}
            <div className="border-t border-gray-100 dark:border-gray-800 px-3 py-3">
              <div className="px-3 py-2 mb-1">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-200 truncate">{user?.name}</p>
                <p className="text-xs text-gray-400 truncate">{user?.email}</p>
              </div>
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  logout();
                }}
                className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 transition-colors"
              >
                <LogOut size={18} className="text-gray-400" />
                ログアウト
              </button>
            </div>
          </nav>
        </div>
      )}
    </>
  );
}
