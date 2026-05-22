/**
 * APIクライアント
 * Axiosをラップして認証トークン管理・エラーハンドリングを一元化する
 */
import axios, { AxiosError, AxiosInstance } from 'axios';
import {
  AuthResponse,
  DayCompletions,
  Goal,
  GoalCompletion,
  GoalFormData,
  LoginFormData,
  MonthlyStatsResponse,
  OverviewStats,
  RegisterFormData,
  ToggleCompletionData,
  User,
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
      // クライアントサイドのみリダイレクト
      if (typeof window !== 'undefined') {
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

export default apiClient;
