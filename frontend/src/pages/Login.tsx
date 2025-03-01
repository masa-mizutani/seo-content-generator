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
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    onSubmit: async (values) => {
      try {
        setIsSubmitting(true);
        setError(null);
        
        // APIのURL
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
        console.log('API URL:', apiUrl);
        
        // APIリクエストを直接ここで行う
        const response = await fetch(`${apiUrl}/api/v1/auth/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify({
            email: values.email,
            password: values.password,
          }),
          mode: 'cors',
          credentials: 'same-origin',
        });
        
        console.log('Login response status:', response.status);
        
        if (!response.ok) {
          let errorMessage = 'ログインに失敗しました';
          try {
            const errorData = await response.json();
            errorMessage = errorData.detail || errorMessage;
          } catch (e) {
            console.error('Error parsing error response:', e);
          }
          throw new Error(errorMessage);
        }
        
        const data = await response.json();
        console.log('Login successful:', data);
        
        // トークンを保存
        localStorage.setItem('token', data.access_token);
        
        // ユーザー情報を保存
        if (data.user) {
          localStorage.setItem('user', JSON.stringify(data.user));
        }
        
        // ダッシュボードへリダイレクト
        navigate('/');
      } catch (error: any) {
        console.error('Login error:', error);
        setError(error.message || 'ログインに失敗しました。認証情報を確認してください。');
      } finally {
        setIsSubmitting(false);
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
            disabled={isSubmitting}
            sx={{ mb: 2 }}
          >
            {isSubmitting ? (
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
