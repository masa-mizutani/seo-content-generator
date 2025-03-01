import React from 'react';
import { AppBar, Toolbar, Typography, Box, IconButton } from '@mui/material';
import { AccountCircle } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

/**
 * ナビゲーションバーコンポーネント
 * 
 * このコンポーネントは簡素化され、以下の変更が行われました：
 * 1. コンテンツ生成とダッシュボードへのリンクを削除
 * 2. 設定ページへのリンクを削除
 * 3. ユーザーアイコンのみを表示
 */
const Navbar: React.FC = () => {
  const { user } = useAuth();

  // ユーザーがログインしていない場合は何も表示しない
  if (!user) {
    return null;
  }

  return (
    <AppBar position="static" color="primary">
      <Toolbar>
        {/* アプリケーションタイトル */}
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          SEO Content Generator
        </Typography>

        {/* ユーザーアイコンのみを表示 */}
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton size="large" aria-label="account of current user" color="inherit">
            <AccountCircle />
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
