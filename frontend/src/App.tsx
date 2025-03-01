import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Box, Container, CircularProgress } from '@mui/material';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import ContentGeneration from './pages/ContentGeneration';
import Login from './pages/Login';
import Register from './pages/Register';

// 認証が必要なルートのラッパーコンポーネント
const PrivateRoute: React.FC<{ element: React.ReactElement }> = ({ element }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return user ? element : <Navigate to="/login" />;
};

// ダッシュボードページは削除され、すべてのアクセスはコンテンツ生成ページにリダイレクトされます
function AppContent() {
  console.log('AppContent rendered - All dashboard access redirected to /generate');
  
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <Container component="main" sx={{ mt: 4, mb: 4, flex: 1 }}>
        <Routes>
          {/* ルートパスはコンテンツ生成ページにリダイレクト */}
          <Route path="/" element={<Navigate to="/generate" replace />} />
          
          {/* コンテンツ生成ページ */}
          <Route path="/generate" element={<PrivateRoute element={<ContentGeneration />} />} />
          
          {/* 認証ページ */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* その他のパスはすべてコンテンツ生成ページにリダイレクト */}
          <Route path="*" element={<Navigate to="/generate" replace />} />
        </Routes>
      </Container>
    </Box>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
