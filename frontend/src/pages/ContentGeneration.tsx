import React from 'react';
import { useFormik } from 'formik';
import * as yup from 'yup';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  CircularProgress,
  Grid,
  Card,
  CardContent,
  CardActions,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { useContentGeneration } from '../hooks/useContentGeneration';

const validationSchema = yup.object({
  keyword: yup
    .string()
    .required('キーワードを入力してください'),
  maxResults: yup
    .number()
    .min(1, '1以上の数値を入力してください')
    .max(10, '10以下の数値を入力してください')
    .required('検索結果数を入力してください'),
});

const ContentGeneration = () => {
  const {
    contents,
    isLoadingContents,
    selectedContent,
    setSelectedContent,
    generateContent,
    isGenerating,
    updateContent,
    isUpdating,
    deleteContent,
    isDeleting,
    error,
    refetchContents,
  } = useContentGeneration();

  const formik = useFormik({
    initialValues: {
      keyword: '',
      maxResults: 5,
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      try {
        await generateContent(values);
        formik.resetForm();
      } catch (error) {
        console.error('Error generating content:', error);
      }
    },
  });

  const handleDelete = async (id: number) => {
    if (window.confirm('本当に削除しますか？')) {
      await deleteContent(id);
    }
  };

  const handleCloseDialog = () => {
    setSelectedContent(null);
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        コンテンツ生成
      </Typography>

      {/* 生成フォーム */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <form onSubmit={formik.handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={8}>
              <TextField
                fullWidth
                id="keyword"
                name="keyword"
                label="キーワード"
                value={formik.values.keyword}
                onChange={formik.handleChange}
                error={formik.touched.keyword && Boolean(formik.errors.keyword)}
                helperText={formik.touched.keyword && formik.errors.keyword}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                id="maxResults"
                name="maxResults"
                label="検索結果数"
                type="number"
                value={formik.values.maxResults}
                onChange={formik.handleChange}
                error={formik.touched.maxResults && Boolean(formik.errors.maxResults)}
                helperText={formik.touched.maxResults && formik.errors.maxResults}
              />
            </Grid>
            <Grid item xs={12}>
              <Button
                color="primary"
                variant="contained"
                fullWidth
                type="submit"
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <CircularProgress size={24} />
                ) : (
                  'コンテンツを生成'
                )}
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>

      {/* 生成済みコンテンツ一覧 */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5">
          生成済みコンテンツ
        </Typography>
        <Button 
          variant="outlined" 
          onClick={() => refetchContents()}
          disabled={isLoadingContents}
        >
          {isLoadingContents ? <CircularProgress size={20} /> : '更新'}
        </Button>
      </Box>
      
      {isLoadingContents ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : contents && contents.length > 0 ? (
        <Grid container spacing={3}>
          {contents.map((content) => (
            <Grid item xs={12} md={6} key={content.id}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {content.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    キーワード: {content.keyword}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    作成日: {new Date(content.created_at).toLocaleDateString()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    ステータス: {content.status}
                  </Typography>
                </CardContent>
                <CardActions>
                  <IconButton
                    onClick={() => setSelectedContent(content)}
                    aria-label="edit"
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    onClick={() => handleDelete(content.id)}
                    aria-label="delete"
                    disabled={isDeleting}
                  >
                    <DeleteIcon />
                  </IconButton>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="body1" color="text.secondary">
            生成済みコンテンツはありません
          </Typography>
        </Box>
      )}

      {/* コンテンツ編集ダイアログ */}
      <Dialog
        open={Boolean(selectedContent)}
        onClose={handleCloseDialog}
        fullWidth
        maxWidth="md"
      >
        {selectedContent && (
          <>
            <DialogTitle>コンテンツの編集</DialogTitle>
            <DialogContent>
              <Box sx={{ mt: 2 }}>
                <Typography variant="h6" gutterBottom>
                  {selectedContent.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  キーワード: {selectedContent.keyword}
                </Typography>
                <Typography variant="body1" paragraph>
                  {selectedContent.content}
                </Typography>
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialog} color="primary">
                閉じる
              </Button>
              <Button
                onClick={() =>
                  updateContent({
                    id: selectedContent.id,
                    data: { status: 'published' },
                  })
                }
                color="primary"
                disabled={isUpdating}
              >
                {isUpdating ? <CircularProgress size={24} /> : '公開する'}
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default ContentGeneration;
