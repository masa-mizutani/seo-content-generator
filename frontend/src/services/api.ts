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

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
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
    const response = await api.post<AuthResponse>('/auth/login', data);
    localStorage.setItem('token', response.data.access_token);
    return response.data;
  },

  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/register', data);
    localStorage.setItem('token', response.data.access_token);
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('token');
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await api.get<User>('/auth/me');
    return response.data;
  },
};

// コンテンツ生成関連のAPI
export const contentApi = {
  generate: async (data: GenerationRequest): Promise<GeneratedContent> => {
    const response = await api.post<GeneratedContent>('/content/generate', data);
    return response.data;
  },

  getContents: async (): Promise<GeneratedContent[]> => {
    const response = await api.get<GeneratedContent[]>('/content');
    return response.data;
  },

  getContent: async (id: number): Promise<GeneratedContent> => {
    const response = await api.get<GeneratedContent>(`/content/${id}`);
    return response.data;
  },

  updateContent: async (id: number, data: Partial<GeneratedContent>): Promise<GeneratedContent> => {
    const response = await api.put<GeneratedContent>(`/content/${id}`, data);
    return response.data;
  },

  deleteContent: async (id: number): Promise<void> => {
    await api.delete(`/content/${id}`);
  },
};

// WordPress関連のAPI
export const wordpressApi = {
  getConfig: async (): Promise<WordPressConfig> => {
    const response = await api.get<WordPressConfig>('/wordpress/config');
    return response.data;
  },

  updateConfig: async (data: Partial<WordPressConfig>): Promise<WordPressConfig> => {
    const response = await api.put<WordPressConfig>('/wordpress/config', data);
    return response.data;
  },

  publishToWordPress: async (contentId: number): Promise<GeneratedContent> => {
    const response = await api.post<GeneratedContent>(`/wordpress/publish/${contentId}`);
    return response.data;
  },
};
