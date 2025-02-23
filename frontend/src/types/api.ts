// ユーザー関連の型定義
export interface User {
  id: number;
  email: string;
  company_name: string;
  phone_number: string;
  created_at: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  company_name: string;
  phone_number: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

// コンテンツ生成関連の型定義
export interface SearchResult {
  title: string;
  url: string;
  snippet: string;
}

export interface GenerationRequest {
  keyword: string;
  max_results?: number;
}

export interface GeneratedContent {
  id: number;
  keyword: string;
  title: string;
  content: string;
  created_at: string;
  user_id: number;
  status: 'draft' | 'published';
  wordpress_post_id?: number;
}

// WordPress関連の型定義
export interface WordPressConfig {
  id: number;
  user_id: number;
  site_url: string;
  username: string;
  application_password: string;
}
