import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';

// Create _redirects file for SPA routing
const redirectsContent = '/* /index.html 200';
fs.writeFileSync('./public/_redirects', redirectsContent);

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: 'dist',
  },
  server: {
    port: 3000,
    strictPort: true,
    host: true,
    historyApiFallback: true,
  }
});
