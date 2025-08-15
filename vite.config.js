import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  server: {
    port: 3001,
    // 移除代理配置，因为现在有独立的后端服务
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets'
  }
})
