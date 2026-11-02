import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // 개발 중 CORS·쿠키 문제를 피하려고 /api 를 백엔드로 프록시
    proxy: { '/api': { target: 'http://api.triplej.cloud', changeOrigin: true } },
  },
})
