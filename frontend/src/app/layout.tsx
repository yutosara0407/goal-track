import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from 'react-hot-toast';
import { Providers } from '@/components/providers/Providers';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: { template: '%s | GoalTrack', default: 'GoalTrack - 目標達成管理アプリ' },
  description: '日々の目標を登録・記録して、習慣を形成するアプリ',
};

// ブラウザ・PWAのUIクロームをブランドカラーに統一（favicon/PWAアイコンはicon.svg・apple-icon.png・manifest.tsで管理）
export const viewport: Viewport = {
  themeColor: '#6366f1',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" className={inter.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: `(function(){try{var t=localStorage.getItem('theme');if(t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme: dark)').matches)){document.documentElement.classList.add('dark')}}catch(e){}})()` }} />
      </head>
      <body className="min-h-screen antialiased">
        <Providers>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: { borderRadius: '12px', background: '#1e293b', color: '#f8fafc', fontSize: '14px' },
              success: { iconTheme: { primary: '#22c55e', secondary: '#f8fafc' } },
              error: { iconTheme: { primary: '#ef4444', secondary: '#f8fafc' } },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
