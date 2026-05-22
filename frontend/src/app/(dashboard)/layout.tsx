/**
 * ダッシュボードレイアウト
 * 認証が必要な全ページ共通のレイアウト
 * サイドバー（デスクトップ）とヘッダー（モバイル）を提供する
 */
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-950">
      {/* デスクトップ: 左サイドバー */}
      <Sidebar />

      {/* メインコンテンツエリア */}
      <div className="flex-1 flex flex-col min-w-0 overflow-auto">
        {/* モバイル: 上部ヘッダー */}
        <Header />

        {/* ページコンテンツ */}
        <main className="flex-1 p-4 lg:p-8 max-w-6xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
