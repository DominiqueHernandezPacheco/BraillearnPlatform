import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(),],
  base: './',
  server: {
    proxy: {
      // El navegador le pega a esto para las preguntas abiertas de "Braulio"
      // (ver server/index.cjs) — evita CORS y mantiene la API key fuera del cliente.
      '/api': {
        target: 'http://localhost:8787',
        changeOrigin: true,
      },
    },
  },
})
