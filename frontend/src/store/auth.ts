/**
 * 認証状態のグローバルストア（Zustand）
 * ログイン状態・ユーザー情報をアプリ全体で共有する
 */
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { User } from '@/types';
import { saveToken, removeToken } from '@/lib/api';

interface AuthState {
  /** 認証済みユーザー（未ログイン時はnull） */
  user: User | null;
  /** 認証済みかどうか */
  isAuthenticated: boolean;
  /** 認証状態の初期化が完了したか（ちらつき防止） */
  isInitialized: boolean;

  // アクション
  /** ログイン成功後にユーザー情報とトークンをセット */
  login: (user: User, token: string) => void;
  /** ログアウト処理（状態クリア） */
  logout: () => void;
  /** ユーザー情報を更新 */
  setUser: (user: User) => void;
  /** 初期化完了フラグをセット */
  setInitialized: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isInitialized: false,

      login: (user: User, token: string) => {
        // トークンをローカルストレージに保存
        saveToken(token);
        set({ user, isAuthenticated: true, isInitialized: true });
      },

      logout: () => {
        // トークンを削除
        removeToken();
        set({ user: null, isAuthenticated: false });
      },

      setUser: (user: User) => {
        set({ user });
      },

      setInitialized: () => {
        set({ isInitialized: true });
      },
    }),
    {
      name: 'goal-app-auth',       // ローカルストレージのキー名
      storage: createJSONStorage(() => localStorage),
      // トークンは api.ts が管理するため、ストアにはユーザー情報のみ保存
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
);
