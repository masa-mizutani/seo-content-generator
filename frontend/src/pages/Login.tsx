import React, { useState, useEffect } from 'react';
import { useFormik } from 'formik';
import * as yup from 'yup';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Link,
  Alert,
  CircularProgress,
} from '@mui/material';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const validationSchema = yup.object({
  email: yup
    .string()
    .email('有効なメールアドレスを入力してください')
    .required('メールアドレスを入力してください'),
  password: yup
    .string()
    .required('パスワードを入力してください'),
});

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  useEffect(() => {
    const state = location.state as { message?: string } | null;
    if (state?.message) {
      setSuccess(state.message);
      // stateをリセット
      navigate(location.pathname, { replace: true });
    }
  }, [location, navigate]);

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
    },
    validationSchema: validationSchema,
    onSubmit: async (values, { setSubmitting, setStatus }) => {
      try {
        setStatus(null);
        setIsLoggingIn(true);
        console.log('Logging in with:', values);

        // APIエンドポイントのURLを構築
        const loginUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/v1/auth/login`;
        console.log('Login URL:', loginUrl);

        // FormDataを使用してOAuth2形式で送信
        const formData = new URLSearchParams();
        formData.append('username', values.email);
        formData.append('password', values.password);

        // 直接fetchを使用してログイン
        const response = await fetch(loginUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: formData,
          credentials: 'include',
        });

        console.log('Login response status:', response.status);
        
        if (!response.ok) {
          let errorMessage = 'ログインに失敗しました';
          try {
            const errorData = await response.json();
            console.log('Error data:', errorData);
            
            if (typeof errorData.detail === 'string') {
              errorMessage = errorData.detail;
            } else if (errorData.detail && Array.isArray(errorData.detail)) {
              errorMessage = errorData.detail.map((err: any) => err.msg || JSON.stringify(err)).join(', ');
            } else if (errorData.detail && typeof errorData.detail === 'object') {
              errorMessage = JSON.stringify(errorData.detail);
            }
          } catch (e) {
            console.error('Error parsing error response:', e);
          }
          throw new Error(errorMessage);
        }
        
        const data = await response.json();
        console.log('Login successful:', data);
        
        // トークンを保存
        if (data.access_token) {
          localStorage.setItem('token', data.access_token);
          
          // ログイン処理の完了
          try {
            await login(values.email, values.password);
            
            // コンテンツ生成ページへリダイレクト
            navigate('/generate');
          } catch (loginError) {
            console.error('Error during login context update:', loginError);
            throw loginError;
          }
        } else {
          throw new Error('トークンが取得できませんでした');
        }
      } catch (error) {
        console.error('Login error:', error);
        setStatus(error instanceof Error ? error.message : '予期せぬエラーが発生しました');
      } finally {
        setSubmitting(false);
        setIsLoggingIn(false);
      }
    },
  });

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <Typography variant="h4" gutterBottom>
        ログイン
      </Typography>
      <Paper sx={{ p: 3, maxWidth: 400, width: '100%' }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}
        <form onSubmit={formik.handleSubmit}>
          <TextField
            fullWidth
            id="email"
            name="email"
            label="メールアドレス"
            value={formik.values.email}
            onChange={formik.handleChange}
            error={formik.touched.email && Boolean(formik.errors.email)}
            helperText={formik.touched.email && formik.errors.email}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            id="password"
            name="password"
            label="パスワード"
            type="password"
            value={formik.values.password}
            onChange={formik.handleChange}
            error={formik.touched.password && Boolean(formik.errors.password)}
            helperText={formik.touched.password && formik.errors.password}
            sx={{ mb: 2 }}
          />
          <Button
            color="primary"
            variant="contained"
            fullWidth
            type="submit"
            disabled={isLoggingIn}
            sx={{ mb: 2 }}
          >
            {isLoggingIn ? (
              <>
                <CircularProgress size={24} sx={{ mr: 1, color: 'white' }} />
                ログイン中...
              </>
            ) : (
              'ログイン'
            )}
          </Button>
          <Box sx={{ textAlign: 'center' }}>
            <Link component={RouterLink} to="/register">
              アカウントをお持ちでない方はこちら
            </Link>
          </Box>
        </form>
      </Paper>
    </Box>
  );
};

export default Login;
