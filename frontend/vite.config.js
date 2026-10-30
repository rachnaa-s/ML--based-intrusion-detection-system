import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    open: false,
    proxy: {
      '/health': 'http://127.0.0.1:5000',
      '/schema': 'http://127.0.0.1:5000',
      '/presets': 'http://127.0.0.1:5000',
      '/predict': 'http://127.0.0.1:5000',
      '/api': 'http://127.0.0.1:5000'
    }
  }
});
