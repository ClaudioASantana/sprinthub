import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// Alvo do proxy: sobrescreva com VITE_API_URL se o backend nao estiver na porta padrao.
const API_TARGET = process.env.VITE_API_URL || 'http://localhost:3005'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    proxy: {
      '/api': {
        target: API_TARGET,
        changeOrigin: true,
      },
    },
  },
})
