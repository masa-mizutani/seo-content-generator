import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';

/**
 * ダッシュボードコンポーネント
 * 
 * このコンポーネントは完全に簡素化され、コンテンツ生成ページに自動的にリダイレクトします。
 * 以前の実装（統計情報やカードの表示など）はすべて削除されました。
 */
const Dashboard: React.FC = () => {
  // コンポーネントがマウントされたときにコンソールにログを出力
  useEffect(() => {
    console.log('Dashboard component mounted - Redirecting to /generate');
  }, []);

  // コンテンツ生成ページに即座にリダイレクト
  return <Navigate to="/generate" replace />;
};

export default Dashboard;
