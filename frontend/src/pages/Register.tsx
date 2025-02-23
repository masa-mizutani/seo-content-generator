import React from 'react';
import { useFormik } from 'formik';
import * as yup from 'yup';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Link,
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

const validationSchema = yup.object({
  email: yup
    .string()
    .email('有効なメールアドレスを入力してください')
    .required('メールアドレスを入力してください'),
  password: yup
    .string()
    .min(8, 'パスワードは8文字以上である必要があります')
    .required('パスワードを入力してください'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password')], 'パスワードが一致しません')
    .required('パスワードを再入力してください'),
  companyName: yup
    .string()
    .required('会社名を入力してください'),
  phoneNumber: yup
    .string()
    .required('電話番号を入力してください'),
});

const Register = () => {
  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
      confirmPassword: '',
      companyName: '',
      phoneNumber: '',
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      try {
        // TODO: API呼び出しを実装
        console.log('Registering:', values);
      } catch (error) {
        console.error('Registration error:', error);
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
        アカウント登録
      </Typography>
      <Paper sx={{ p: 3, maxWidth: 400, width: '100%' }}>
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
          <TextField
            fullWidth
            id="confirmPassword"
            name="confirmPassword"
            label="パスワード（確認）"
            type="password"
            value={formik.values.confirmPassword}
            onChange={formik.handleChange}
            error={formik.touched.confirmPassword && Boolean(formik.errors.confirmPassword)}
            helperText={formik.touched.confirmPassword && formik.errors.confirmPassword}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            id="companyName"
            name="companyName"
            label="会社名"
            value={formik.values.companyName}
            onChange={formik.handleChange}
            error={formik.touched.companyName && Boolean(formik.errors.companyName)}
            helperText={formik.touched.companyName && formik.errors.companyName}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            id="phoneNumber"
            name="phoneNumber"
            label="電話番号"
            value={formik.values.phoneNumber}
            onChange={formik.handleChange}
            error={formik.touched.phoneNumber && Boolean(formik.errors.phoneNumber)}
            helperText={formik.touched.phoneNumber && formik.errors.phoneNumber}
            sx={{ mb: 2 }}
          />
          <Button
            color="primary"
            variant="contained"
            fullWidth
            type="submit"
            sx={{ mb: 2 }}
          >
            登録
          </Button>
          <Box sx={{ textAlign: 'center' }}>
            <Link component={RouterLink} to="/login">
              すでにアカウントをお持ちの方はこちら
            </Link>
          </Box>
        </form>
      </Paper>
    </Box>
  );
};

export default Register;
