import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(),],
  base: './',
  build: {
    rollupOptions: {
      // La landing (raíz del sitio) y la plataforma (/plataforma/) son entradas independientes.
      input: {
        landing: fileURLToPath(new URL('./index.html', import.meta.url)),
        plataforma: fileURLToPath(new URL('./plataforma/index.html', import.meta.url)),
        historia: fileURLToPath(new URL('./historia.html', import.meta.url)),
        tecnologia: fileURLToPath(new URL('./tecnologia.html', import.meta.url)),
        comunidad: fileURLToPath(new URL('./comunidad.html', import.meta.url)),
        platformDemo: fileURLToPath(new URL('./platform-demo.html', import.meta.url)),
      },
    },
  },
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
