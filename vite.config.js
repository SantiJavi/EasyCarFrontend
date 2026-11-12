import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// En desarrollo /api y /auth se reenvian al backend (mismo origen, sin CORS).
// El destino sale de API_PROXY_TARGET en .env (sin prefijo VITE_: no se expone
// al navegador). En produccion se define VITE_API_URL con la URL absoluta.
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const apiTarget = env.API_PROXY_TARGET || 'http://localhost:8080'

  return {
    plugins: [react(), tailwindcss()],
    build: {
      target: 'es2020',
      sourcemap: false,
      // Separa el vendor del codigo de la app: los assets con hash se cachean
      // un año en el CDN y un deploy nuevo solo invalida su propio chunk.
      // Vite 8 (rolldown) exige manualChunks como funcion, no como objeto.
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (!id.includes('node_modules')) return undefined
            if (id.includes('react-router')) return 'router'
            if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/')) return 'react'
            return 'vendor'
          },
        },
      },
    },
    server: {
      port: 5173,
      proxy: {
        '/api': { target: apiTarget, changeOrigin: true },
        '/auth': { target: apiTarget, changeOrigin: true },
      },
    },
  }
})
