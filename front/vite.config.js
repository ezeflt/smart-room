import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',       // Permet l'accès depuis l'extérieur du container
    port: 5173,            // Assure qu'on utilise le bon port
    watch: {
      usePolling: true,    // Active le polling pour détecter les changements dans Docker
    },
  },
})
