/**
 * ルートレイアウト
 * 全ページ共通の設定: フォント、プロバイダー、グローバルスタイル
 */
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from 'react-hot-toast';
import { QueryProvider } from '@/components/providers/QueryProvider';
import './globals.css';

// Inter フォントを使用（日本語と相性の良いフォント）
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: {
    template: '%s | GoalTrack',
    default: 'GoalTrack - 目標達成管理アプリ',
  },
  description: '日々の目標を登録・記録して、習慣を形成するアプリ',
  keywords: ['目標管理', '習慣形成', 'ゴール達成', 'タスク管理'],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className={inter.variable}>
      <body className="min-h-screen antialiased">
        {/* データフェッチ状態管理 */}
        <QueryProvider>
          {children}
          {/* トースト通知（ページ上部に表示） */}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                borderRadius: '12px',
                background: '#1e293b',
                color: '#f8fafc',
                fontSize: '14px',
              },
              success: {
                iconTheme: {
                  primary: '#22c55e',
                  secondary: '#f8fafc',
                },
              },
              error: {
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#f8fafc',
                },
              },
            }}
          />
        </QueryProvider>
      </body>
    </html>
  );
}
