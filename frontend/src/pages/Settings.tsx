import React from 'react';
import { useFormik } from 'formik';
import * as yup from 'yup';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Grid,
  CircularProgress,
} from '@mui/material';
import { wordpressApi } from '../services/api';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

const wordpressValidationSchema = yup.object({
  site_url: yup.string().url('有効なURLを入力してください').required('サイトURLを入力してください'),
  username: yup.string().required('ユーザー名を入力してください'),
  application_password: yup.string().required('アプリケーションパスワードを入力してください'),
});

const Settings = () => {
  const queryClient = useQueryClient();

  // WordPress設定の取得
  const {
    data: wordpressConfig,
    isLoading: isLoadingWordPress,
  } = useQuery({
    queryKey: ['wordpress-config'],
    queryFn: () => wordpressApi.getConfig(),
  });

  // WordPress設定の更新
  const updateWordPressMutation = useMutation({
    mutationFn: (data: any) => wordpressApi.updateConfig(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wordpress-config'] });
    },
  });

  const wordpressFormik = useFormik({
    initialValues: {
      site_url: wordpressConfig?.site_url || '',
      username: wordpressConfig?.username || '',
      application_password: wordpressConfig?.application_password || '',
    },
    validationSchema: wordpressValidationSchema,
    enableReinitialize: true,
    onSubmit: async (values) => {
      try {
        await updateWordPressMutation.mutateAsync(values);
      } catch (error) {
        console.error('Error updating WordPress config:', error);
      }
    },
  });

  if (isLoadingWordPress) {
    return <CircularProgress />;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        設定
      </Typography>
      
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" gutterBottom>
          WordPress設定
        </Typography>
        <form onSubmit={wordpressFormik.handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                id="site_url"
                name="site_url"
                label="サイトURL"
                value={wordpressFormik.values.site_url}
                onChange={wordpressFormik.handleChange}
                error={wordpressFormik.touched.site_url && Boolean(wordpressFormik.errors.site_url)}
                helperText={wordpressFormik.touched.site_url && wordpressFormik.errors.site_url}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                id="username"
                name="username"
                label="ユーザー名"
                value={wordpressFormik.values.username}
                onChange={wordpressFormik.handleChange}
                error={wordpressFormik.touched.username && Boolean(wordpressFormik.errors.username)}
                helperText={wordpressFormik.touched.username && wordpressFormik.errors.username}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                id="application_password"
                name="application_password"
                label="アプリケーションパスワード"
                type="password"
                value={wordpressFormik.values.application_password}
                onChange={wordpressFormik.handleChange}
                error={wordpressFormik.touched.application_password && Boolean(wordpressFormik.errors.application_password)}
                helperText={wordpressFormik.touched.application_password && wordpressFormik.errors.application_password}
              />
            </Grid>
            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={updateWordPressMutation.isPending}
              >
                {updateWordPressMutation.isPending ? '更新中...' : '設定を更新'}
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
};

export default Settings;
