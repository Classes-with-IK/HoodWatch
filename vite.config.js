import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
   server: {
        proxy: {
          '/api': {
            target: 'https://1-community-watch-api.vercel.app',
            changeOrigin: true,
            secure: true
          }
        }
      }
})
