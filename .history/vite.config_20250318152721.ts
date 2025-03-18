import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      '@mui/material',
      '@mui/material/styles',
      '@mui/material/CssBaseline'
    ],
    force: true
  },
  server: {
    hmr: true,
    watch: {
      usePolling: true
    }
  }
}) 
