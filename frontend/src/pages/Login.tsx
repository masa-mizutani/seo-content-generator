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
import { useAuth } from '../contexts/AuthContext';
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

  const handleSubmit = async (values: FormValues, { setSubmitting, setStatus }: FormikHelpers<FormValues>) => {
    try {
      setError(null);
      setStatus(null);
      setIsLoggingIn(true);
      console.log('Logging in with:', values);

      try {
        // authApiを使用してログイン
        await authApi.login(values.email, values.password);
        
        // ユーザー情報を取得してコンテキストを更新
        try {
          await authApi.getCurrentUser();
          
          // コンテンツ生成ページへリダイレクト
          navigate('/generate');
        } catch (userError) {
          console.error('Error during user data fetch:', userError);
          setError('ユーザー情報の取得に失敗しました。再度ログインしてください。');
          throw userError;
        }
      } catch (loginError) {
        console.error('Login API error:', loginError);
        if (loginError instanceof Error) {
          setError(loginError.message);
        } else {
          setError('ログインに失敗しました');
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      // エラーがまだ設定されていない場合のみ設定
      if (!error) {
        setError('予期せぬエラーが発生しました。再度お試しください。');
      }
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
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
      <Paper elevation={3} sx={{ p: 4, width: '100%', maxWidth: 400 }}>
        <Typography variant="h5" component="h1" gutterBottom align="center">
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
        
        {formik.status && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {formik.status}
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
            sx={{ mb: 2, mt: 2 }}
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
            <Link component={RouterLink} to="/register" variant="body2">
              アカウントをお持ちでない方はこちら
            </Link>
          </Box>
        </form>
      </Paper>
    </Box>
  );
};

export default Login;
