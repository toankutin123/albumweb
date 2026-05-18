import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/',
  server: {
    port: 3000,
    proxy: {
      // Dev proxy: forward /api/* to the local backend.
      // In production, nginx handles this via the /api/ location block.
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        // Do not rewrite the path — backend mounts routes at /api/*
        rewrite: (path) => path
      }
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: false
  }
})
