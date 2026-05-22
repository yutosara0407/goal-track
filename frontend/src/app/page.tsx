/**
 * ルートページ（ランディングページ）
 * ログイン済みならダッシュボードへ、未ログインならログインページへリダイレクト
 */
import { redirect } from 'next/navigation';

export default function RootPage() {
  // サーバーサイドでのリダイレクト
  // 実際の認証チェックはミドルウェアで行う
  redirect('/dashboard');
}
