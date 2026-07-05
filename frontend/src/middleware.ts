/**
 * Next.js ミドルウェア
 * 認証状態に基づいてページへのアクセスを制御する
 *
 * 注意: ミドルウェアはEdge Runtimeで動作するため、
 * localStorage やZustandストアには直接アクセスできない。
 * Cookieまたは独自のヘッダーで認証状態を判定する。
 */
import { NextRequest, NextResponse } from 'next/server';

/** 認証不要なパス（パブリックルート）。'/'は完全一致、それ以外は前方一致で判定する */
const PUBLIC_PATHS = ['/login', '/register', '/forgot-password', '/reset-password', '/terms', '/privacy'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // パブリックパスはそのまま通す
  // （'/' をstartsWithで判定すると全パスが一致しガードが無効になるため完全一致にする）
  if (pathname === '/' || PUBLIC_PATHS.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // CookieでAPIトークンの存在を確認
  // トークン自体はローカルストレージに保存するため、
  // ここではCookieに保存した認証フラグで判断する
  const isAuthenticated = request.cookies.has('goal_app_auth');

  if (!isAuthenticated) {
    // 未認証の場合はログインページへリダイレクト
    const loginUrl = new URL('/login', request.url);
    // ログイン後に元のページへ戻れるようにリダイレクト先を保存
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  // ミドルウェアを適用するパスのパターン
  matcher: [
    // Next.js の内部パス・静的ファイル・favicon/PWAアイコン・マニフェストを除外
    // （ブラウザは未ログイン状態のページでもこれらを取得するため、認証ガードの対象外にする）
    '/((?!_next/static|_next/image|favicon.ico|icon.svg|apple-icon.png|manifest.webmanifest|icons/|api).*)',
  ],
};
