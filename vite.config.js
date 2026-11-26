import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

export default defineConfig(({ command }) => ({
  plugins: [react(), tailwindcss()],
  server: {
    proxy:
      command === 'serve'
        ? {
            '/api/dummyjson': {
              target: 'https://dummyjson.com',
              changeOrigin: true,
              rewrite: (path) => path.replace(/^\/api\/dummyjson/, ''),
            },
            '/dummyjson-images': {
              target: 'https://cdn.dummyjson.com',
              changeOrigin: true,
              rewrite: (path) => path.replace(/^\/dummyjson-images(?=\/|[?#]|$)/, ''),
            },
          }
        : undefined,
  },
}))
