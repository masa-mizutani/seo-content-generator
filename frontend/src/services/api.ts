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
    'Accept': 'application/json',
  },
  withCredentials: false,
});

// リクエストインターセプター
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// レスポンスインターセプター
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    console.error('API Error:', error);
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// 認証関連のAPI
export const authApi = {
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    // FormDataを使用してOAuth2形式で送信
    const formData = new URLSearchParams();
    formData.append('username', data.email);
    formData.append('password', data.password);

    const response = await api.post<AuthResponse>('/api/v1/auth/login', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    localStorage.setItem('token', response.data.access_token);
    return response.data;
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
    const response = await api.get<User>('/api/v1/auth/me');
    return response.data;
  },
};

// コンテンツ生成関連のAPI
export const contentApi = {
  generate: async (data: GenerationRequest): Promise<GeneratedContent> => {
    const response = await api.post<GeneratedContent>('/api/v1/content/generate', data);
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
