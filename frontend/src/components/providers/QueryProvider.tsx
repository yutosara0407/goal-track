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
  useEffect(() => {
    const runSync = () => {
      // Zustand 水和後の実際の状態を取得
      const { isAuthenticated, logout, setInitialized } = useAuthStore.getState();
      const hasCookie = document.cookie.includes('goal_app_auth');
      const hasToken = !!getToken();

      if (isAuthenticated && hasToken && !hasCookie) {
        // Cookie がない → 復元
        document.cookie = 'goal_app_auth=1; path=/; SameSite=Lax';
      } else if (isAuthenticated && !hasToken) {
        // トークンなし → 強制ログアウト
        logout();
      }
      // Cookie/トークン整合性チェック完了後に初期化フラグをセット
      setInitialized();
    };

    // persist が既に水和済み（同期ストレージ等）ならすぐ実行
    if (useAuthStore.persist.hasHydrated()) {
      runSync();
    } else {
      // 水和完了イベントを待ってから実行
      return useAuthStore.persist.onFinishHydration(runSync);
    }
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
