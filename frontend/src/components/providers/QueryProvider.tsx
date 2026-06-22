/**
 * TanStack Queryのプロバイダーコンポーネント
 * Client Componentとして定義し、Server Componentのlayout.tsxから利用する
 */
'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/auth';
import { getToken } from '@/lib/api';

function AuthSync() {
  const { isAuthenticated, logout, setInitialized } = useAuthStore();

  useEffect(() => {
    const hasCookie = document.cookie.includes('goal_app_auth');
    const hasToken = !!getToken();

    if (isAuthenticated && hasToken && !hasCookie) {
      // localStorage に認証状態があるが Cookie がない → Cookie を復元
      document.cookie = 'goal_app_auth=1; path=/; SameSite=Lax';
    } else if (isAuthenticated && !hasToken) {
      // トークンがないのに認証状態になっている → 強制ログアウト
      logout();
    }
    // 同期完了後に初期化フラグをセット（ページ側のリダイレクト制御に使用）
    setInitialized();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}

export function QueryProvider({ children }: { children: React.ReactNode }) {
  // コンポーネントごとにQueryClientインスタンスを作成することでSSR時の状態混在を防ぐ
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // ウィンドウフォーカス時の自動リフェッチを無効化（モバイルでの誤動作防止）
            refetchOnWindowFocus: false,
            // ネットワークエラー時のリトライ回数
            retry: 1,
            // キャッシュの有効期間: 5分
            staleTime: 5 * 60 * 1000,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <AuthSync />
      {children}
      {/* 開発環境のみDevToolsを表示 */}
      {process.env.NODE_ENV === 'development' && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  );
}
