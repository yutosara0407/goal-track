/**
 * APIクライアント
 * Axiosをラップして認証トークン管理・エラーハンドリングを一元化する
 */
import axios, { AxiosError, AxiosInstance } from 'axios';
import {
  AuthResponse,
  DailyNote,
  DayCompletions,
  ForgotPasswordFormData,
  Goal,
  GoalCompletion,
  GoalFormData,
  LoginFormData,
  MessageResponse,
  MonthlyStatsResponse,
  OverviewStats,
  RegisterFormData,
  ResetPasswordFormData,
  TimelineEntry,
  ToggleCompletionData,
  UpdatePasswordFormData,
  UpdateProfileFormData,
  User,
  UserProfile,
  UserSummary,
} from '@/types';

// ============================================================
// Axiosインスタンスの設定
// ============================================================

const apiClient: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

/** ローカルストレージのトークンキー */
const TOKEN_KEY = 'goal_app_token';

/** トークンをローカルストレージに保存 */
export const saveToken = (token: string): void => {
  localStorage.setItem(TOKEN_KEY, token);
};

/** ローカルストレージからトークンを取得 */
export const getToken = (): string | null => {
  if (typeof window === 'undefined') return null; // SSR対応
  return localStorage.getItem(TOKEN_KEY);
};

/** ローカルストレージからトークンを削除 */
export const removeToken = (): void => {
  localStorage.removeItem(TOKEN_KEY);
};

// リクエストインターセプター: 全リクエストに認証トークンを付与
apiClient.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// レスポンスインターセプター: 401エラー時にログイン画面へリダイレクト
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      removeToken();
      if (typeof window !== 'undefined') {
        // Zustand ストアは循環依存のため直接触らず、Cookie とトークンだけ先にクリア
        // AuthSync がログインページで残りの状態（isAuthenticated）をクリアする
        document.cookie = 'goal_app_auth=; path=/; max-age=0';
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// ============================================================
// 認証API
// ============================================================

export const authApi = {
  /** 新規ユーザー登録 */
  register: async (data: RegisterFormData): Promise<AuthResponse> => {
    const res = await apiClient.post<AuthResponse>('/auth/register', data);
    return res.data;
  },

  /** ログイン */
  login: async (data: LoginFormData): Promise<AuthResponse> => {
    const res = await apiClient.post<AuthResponse>('/auth/login', data);
    return res.data;
  },

  /** ログアウト */
  logout: async (): Promise<void> => {
    await apiClient.post('/auth/logout');
  },

  /** 認証済みユーザー情報の取得 */
  me: async (): Promise<User> => {
    const res = await apiClient.get<User>('/auth/me');
    return res.data;
  },

  /** パスワード再設定メールの送信依頼 */
  forgotPassword: async (data: ForgotPasswordFormData): Promise<MessageResponse> => {
    const res = await apiClient.post<MessageResponse>('/auth/forgot-password', data);
    return res.data;
  },

  /** トークンによるパスワード再設定 */
  resetPassword: async (data: ResetPasswordFormData): Promise<MessageResponse> => {
    const res = await apiClient.post<MessageResponse>('/auth/reset-password', data);
    return res.data;
  },

  /** プロフィール（名前・メールアドレス）の更新 */
  updateProfile: async (data: UpdateProfileFormData): Promise<User> => {
    const res = await apiClient.put<User>('/auth/profile', data);
    return res.data;
  },

  /** ログイン中ユーザーのパスワード変更 */
  updatePassword: async (data: UpdatePasswordFormData): Promise<MessageResponse> => {
    const res = await apiClient.put<MessageResponse>('/auth/password', data);
    return res.data;
  },

  /** アカウント削除（退会） */
  deleteAccount: async (password: string): Promise<MessageResponse> => {
    const res = await apiClient.delete<MessageResponse>('/auth/account', { data: { password } });
    return res.data;
  },
};

// ============================================================
// ソーシャルAPI
// ============================================================

export const usersApi = {
  /** 公開ユーザーを名前・bioで検索 */
  search: async (q: string): Promise<UserSummary[]> => {
    const res = await apiClient.get<UserSummary[]>('/users/search', { params: { q } });
    return res.data;
  },

  /** 公開プロフィールを取得 */
  profile: async (id: number): Promise<UserProfile> => {
    const res = await apiClient.get<UserProfile>(`/users/${id}`);
    return res.data;
  },

  /** フォローする */
  follow: async (id: number): Promise<void> => {
    await apiClient.post(`/users/${id}/follow`);
  },

  /** フォローを解除する */
  unfollow: async (id: number): Promise<void> => {
    await apiClient.delete(`/users/${id}/follow`);
  },

  /** フォロワー一覧 */
  followers: async (id: number): Promise<UserSummary[]> => {
    const res = await apiClient.get<UserSummary[]>(`/users/${id}/followers`);
    return res.data;
  },

  /** フォロー中一覧 */
  following: async (id: number): Promise<UserSummary[]> => {
    const res = await apiClient.get<UserSummary[]>(`/users/${id}/following`);
    return res.data;
  },
};

// ============================================================
// 目標API
// ============================================================

export const goalsApi = {
  /** 目標一覧を取得 */
  list: async (includeInactive = false): Promise<Goal[]> => {
    const res = await apiClient.get<Goal[]>('/goals', {
      params: { include_inactive: includeInactive },
    });
    return res.data;
  },

  /** 目標を作成 */
  create: async (data: GoalFormData): Promise<Goal> => {
    const res = await apiClient.post<Goal>('/goals', data);
    return res.data;
  },

  /** 目標を更新 */
  update: async (id: number, data: Partial<GoalFormData> & { is_active?: boolean }): Promise<Goal> => {
    const res = await apiClient.put<Goal>(`/goals/${id}`, data);
    return res.data;
  },

  /** 目標を削除 */
  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/goals/${id}`);
  },
};

// ============================================================
// 達成記録API
// ============================================================

export const completionsApi = {
  /**
   * 指定日の全目標の達成状況を取得
   * @param date YYYY-MM-DD形式（省略時は今日）
   */
  getByDate: async (date?: string): Promise<DayCompletions> => {
    const res = await apiClient.get<DayCompletions>('/completions', {
      params: date ? { date } : {},
    });
    return res.data;
  },

  /**
   * 達成状態をトグルする（チェックON/OFF）
   */
  toggle: async (data: ToggleCompletionData): Promise<GoalCompletion> => {
    const res = await apiClient.post<GoalCompletion>('/completions/toggle', data);
    return res.data;
  },

  /**
   * 達成記録を削除する（未記録状態に戻す）
   */
  remove: async (id: number): Promise<void> => {
    await apiClient.delete(`/completions/${id}`);
  },

  /**
   * 達成履歴を取得
   * @param from 開始日（YYYY-MM-DD）
   * @param to 終了日（YYYY-MM-DD）
   * @param goalId 特定目標のみ絞り込む場合
   */
  getHistory: async (from?: string, to?: string, goalId?: number): Promise<GoalCompletion[]> => {
    const res = await apiClient.get<GoalCompletion[]>('/completions/history', {
      params: { from, to, goal_id: goalId },
    });
    return res.data;
  },
};

// ============================================================
// 統計API
// ============================================================

export const statsApi = {
  /** ダッシュボード用サマリー統計 */
  overview: async (): Promise<OverviewStats> => {
    const res = await apiClient.get<OverviewStats>('/stats/overview');
    return res.data;
  },

  /**
   * 月次カレンダーデータ
   * @param year 年
   * @param month 月（1-12）
   */
  monthly: async (year: number, month: number): Promise<MonthlyStatsResponse> => {
    const res = await apiClient.get<MonthlyStatsResponse>('/stats/monthly', {
      params: { year, month },
    });
    return res.data;
  },
};

// ============================================================
// 日次ノートAPI（ユーザー単位の日記。目標ごとのメモとは別物）
// ============================================================

export const notesApi = {
  /** 指定日の自分のノートを取得（省略時は今日） */
  get: async (date?: string): Promise<DailyNote> => {
    const res = await apiClient.get<DailyNote>('/notes', {
      params: date ? { date } : {},
    });
    return res.data;
  },

  /** 指定日のノートを保存する（空文字を送ると未記録に戻る） */
  save: async (date: string, body: string): Promise<DailyNote> => {
    const res = await apiClient.put<DailyNote>('/notes', { date, body });
    return res.data;
  },
};

// ============================================================
// タイムラインAPI
// ============================================================

export const timelineApi = {
  /** フォロー中×タイムライン公開ユーザーの直近の達成状況+ノート一覧 */
  list: async (): Promise<TimelineEntry[]> => {
    const res = await apiClient.get<TimelineEntry[]>('/timeline');
    return res.data;
  },
};

export default apiClient;
