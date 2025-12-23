import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // 깃허브 배포를 위한 설정: '/레포지토리-이름/' 형식으로 작성해야 합니다.
  // 예: 레포지토리 주소가 github.com/user/my-movie-app 이라면 '/my-movie-app/'
  base: '/Movie_Web_App/', 
})