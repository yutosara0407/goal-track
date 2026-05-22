/**
 * Next.js ミドルウェア
 * 認証状態に基づいてページへのアクセスを制御する
 *
 * 注意: ミドルウェアはEdge Runtimeで動作するため、
 * localStorage やZustandストアには直接アクセスできない。
 * Cookieまたは独自のヘッダーで認証状態を判定する。
 */
import { NextRequest, NextResponse } from 'next/server';

/** 認証不要なパス（パブリックルート） */
const PUBLIC_PATHS = ['/login', '/register'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // パブリックパスはそのまま通す
  if (PUBLIC_PATHS.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // CookieでAPIトークンの存在を確認
  // トークン自体はローカルストレージに保存するため、
  // ここではCookieに保存した認証フラグで判断する
  const isAuthenticated = request.cookies.has('goal_app_auth');

  if (!isAuthenticated && !PUBLIC_PATHS.includes(pathname)) {
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
    // Next.js の内部パスと静的ファイルを除外
    '/((?!_next/static|_next/image|favicon.ico|api).*)',
  ],
};
