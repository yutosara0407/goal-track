/**
 * TanStack Queryのプロバイダーコンポーネント
 * Client Componentとして定義し、Server Componentのlayout.tsxから利用する
 */
'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState } from 'react';

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
      {children}
      {/* 開発環境のみDevToolsを表示 */}
      {process.env.NODE_ENV === 'development' && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  );
}
