import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
export default defineConfig({
    base: './',
    plugins: [react(), tailwindcss()],
    build: {
      outDir: 'build',  // 指定打包後的輸出目錄
      // 其他配置選項
    },
});
