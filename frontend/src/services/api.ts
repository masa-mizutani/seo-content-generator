import axios from 'axios';
import {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  GenerationRequest,
  GeneratedContent,
  WordPressConfig,
  User,
} from '../types/api';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

console.log('API_BASE_URL:', API_BASE_URL);

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// リクエストインターセプター
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// レスポンスインターセプター
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    console.error('API Error:', error);
    
    // エラーの詳細をログに出力
    if (error.response) {
      console.error('Error response data:', error.response.data);
      console.error('Error response status:', error.response.status);
      console.error('Error response headers:', error.response.headers);
    } else if (error.request) {
      console.error('Error request:', error.request);
    } else {
      console.error('Error message:', error.message);
    }
    
    // 401エラーの場合はログアウト処理
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      // リダイレクトはコンポーネント側で処理
    }
    
    return Promise.reject(error);
  }
);

// 認証関連のAPI
export const authApi = {
  // ログイン処理
  async login(email: string, password: string) {
    const formData = new URLSearchParams();
    formData.append('username', email);
    formData.append('password', password);
    
    try {
      const response = await api.post<AuthResponse>('/api/v1/auth/login', formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });
      
      if (response.data.access_token) {
        localStorage.setItem('token', response.data.access_token);
      }
      
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      
      // エラーメッセージを抽出
      let errorMessage = '認証に失敗しました';
      if (axios.isAxiosError(error) && error.response) {
        const data = error.response.data;
        if (typeof data.detail === 'string') {
          errorMessage = data.detail;
        } else if (data.detail && Array.isArray(data.detail)) {
          errorMessage = data.detail.map((err: any) => err.msg || JSON.stringify(err)).join(', ');
        }
        
        // 認証エラーの場合は特別なメッセージ
        if (error.response.status === 401) {
          errorMessage = 'メールアドレスまたはパスワードが間違っています';
        }
      }
      
      throw new Error(errorMessage);
    }
  },

  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/api/v1/auth/signup', data);
    localStorage.setItem('token', response.data.access_token);
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('token');
  },

  getCurrentUser: async (): Promise<User> => {
    try {
      const response = await api.get<User>('/api/v1/auth/me');
      return response.data;
    } catch (error) {
      console.error('Error getting current user:', error);
      throw error;
    }
  },
};

// コンテンツ生成関連のAPI
export const contentApi = {
  generate: async (data: GenerationRequest): Promise<GeneratedContent> => {
    // URLクエリパラメータとしてkeywordを送信し、リクエストボディにanalysis_resultsを含める
    const response = await api.post<GeneratedContent>(
      `/api/v1/content/generate?keyword=${encodeURIComponent(data.keyword)}`, 
      { analysis_results: data.analysis_results }
    );
    return response.data;
  },

  getContents: async (): Promise<GeneratedContent[]> => {
    const response = await api.get<GeneratedContent[]>('/api/v1/content');
    return response.data;
  },

  getContent: async (id: number): Promise<GeneratedContent> => {
    const response = await api.get<GeneratedContent>(`/api/v1/content/${id}`);
    return response.data;
  },

  updateContent: async (id: number, data: Partial<GeneratedContent>): Promise<GeneratedContent> => {
    const response = await api.put<GeneratedContent>(`/api/v1/content/${id}`, data);
    return response.data;
  },

  deleteContent: async (id: number): Promise<void> => {
    await api.delete(`/api/v1/content/${id}`);
  },
};

// WordPress関連のAPI
export const wordpressApi = {
  getConfig: async (): Promise<WordPressConfig> => {
    const response = await api.get<WordPressConfig>('/api/v1/wordpress/config');
    return response.data;
  },

  updateConfig: async (data: Partial<WordPressConfig>): Promise<WordPressConfig> => {
    const response = await api.put<WordPressConfig>('/api/v1/wordpress/config', data);
    return response.data;
  },

  publishToWordPress: async (contentId: number): Promise<GeneratedContent> => {
    const response = await api.post<GeneratedContent>(`/api/v1/wordpress/publish/${contentId}`);
    return response.data;
  },
};
