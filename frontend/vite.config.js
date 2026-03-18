import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/poop-map/',
  server: {
    proxy: {
      '/poop-map/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/poop-map/, ''),
      },
      '/poop-map/oauth2': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/poop-map/, ''),
      },
      '/poop-map/login/oauth2': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/poop-map/, ''),
      },
      '/poop-map/swagger-ui': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/poop-map/, ''),
      },
      '/poop-map/v3/api-docs': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/poop-map/, ''),
      },
    },
  },
})
