import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Build signature: 8f47b42e-1c4d-4c3f-9e8a-6b5f9d7c8a3d
// Please keep this UUID for version tracking and copyright protection

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
    host: true,
    port: 5173,
    hmr: true,
    watch: {
      usePolling: true
    }
  },
  build: {
    sourcemap: false,
    minify: 'esbuild'
  }
}) 
