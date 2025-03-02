import React, { useState, useEffect } from 'react';
import { useFormik, FormikHelpers } from 'formik';
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
import { authApi } from '../services/api';

// バリデーションスキーマ
const validationSchema = yup.object({
  email: yup
    .string()
    .email('有効なメールアドレスを入力してください')
    .required('メールアドレスを入力してください'),
  password: yup
    .string()
    .required('パスワードを入力してください'),
});

// フォームの値の型定義
interface FormValues {
  email: string;
  password: string;
}

const Login = () => {
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

  const handleSubmit = async (values: FormValues, { setSubmitting, setStatus }: FormikHelpers<FormValues>) => {
    try {
      setError(null);
      setStatus(null);
      setIsLoggingIn(true);
      console.log('Logging in with:', values);

      try {
        // authApiを使用してログイン
        const response = await authApi.login(values.email, values.password);
        console.log('Login successful, token received:', !!response.access_token);
        
        // ユーザー情報を取得してコンテキストを更新
        try {
          const userData = await authApi.getCurrentUser();
          console.log('User data fetched successfully:', userData);
          
          // コンテンツ生成ページへリダイレクト
          navigate('/generate');
        } catch (userError) {
          console.error('Error during user data fetch:', userError);
          setError('ユーザー情報の取得に失敗しました。再度ログインしてください。');
          localStorage.removeItem('token');
        }
      } catch (loginError) {
        console.error('Login API error:', loginError);
        if (loginError instanceof Error) {
          setError(loginError.message);
        } else {
          setError('ログインに失敗しました');
        }
        localStorage.removeItem('token');
      }
    } catch (error) {
      console.error('Login error:', error);
      // エラーがまだ設定されていない場合のみ設定
      if (!error) {
        setError('予期せぬエラーが発生しました。再度お試しください。');
      }
      localStorage.removeItem('token');
    } finally {
      setSubmitting(false);
      setIsLoggingIn(false);
    }
  };

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
    },
    validationSchema: validationSchema,
    onSubmit: handleSubmit,
  });

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        bgcolor: 'background.default',
      }}
    >
      <Paper
        elevation={3}
        sx={{
          p: 4,
          width: '100%',
          maxWidth: 500,
          mx: 2,
        }}
      >
        <Typography variant="h4" component="h1" gutterBottom align="center">
          ログイン
        </Typography>

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
            onBlur={formik.handleBlur}
            error={formik.touched.email && Boolean(formik.errors.email)}
            helperText={formik.touched.email && formik.errors.email}
            margin="normal"
          />
          <TextField
            fullWidth
            id="password"
            name="password"
            label="パスワード"
            type="password"
            value={formik.values.password}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.password && Boolean(formik.errors.password)}
            helperText={formik.touched.password && formik.errors.password}
            margin="normal"
          />
          <Button
            color="primary"
            variant="contained"
            fullWidth
            type="submit"
            disabled={isLoggingIn}
            sx={{ mt: 3, mb: 2 }}
          >
            {isLoggingIn ? <CircularProgress size={24} /> : 'ログイン'}
          </Button>
        </form>

        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Typography variant="body2">
            アカウントをお持ちでない場合は{' '}
            <Link component={RouterLink} to="/register">
              新規登録
            </Link>
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default Login;
