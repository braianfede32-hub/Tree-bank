import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import os from 'node:os'

const PUERTO = 5173

// IP de la PC en la red local: el celular no puede abrir "localhost", asi que
// el QR del modo desarrollo apunta a esta direccion.
const ipLocal = () => {
  for (const redes of Object.values(os.networkInterfaces())) {
    for (const red of redes || []) {
      if (red.family === 'IPv4' && !red.internal) return red.address
    }
  }
  return null
}
const ip = ipLocal()

export default defineConfig({
  plugins: [react()],
  define: {
    __LAN_URL__: JSON.stringify(ip ? `http://${ip}:${PUERTO}` : null),
  },
  server: {
    port: PUERTO,
    host: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        // Desde el celular el Origin es la IP de la PC; el backend solo acepta
        // los origenes de CORS_ORIGINS, asi que se reescribe al de localhost.
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq) => {
            if (proxyReq.getHeader('origin')) proxyReq.setHeader('origin', `http://localhost:${PUERTO}`)
          })
        },
      }
    }
  }
})
