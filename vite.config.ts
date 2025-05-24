import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(async () => ({
  plugins: [react()],
  server: {
    proxy: {
      '/api/printful': {
        target: 'https://api.printful.com',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/api\/printful/, ''),
        configure: (proxy, _options) => {
          proxy.on('proxyReq', (proxyReq, req, res) => {
            // Add Authorization header from environment
            const apiKey = process.env.VITE_PRINTFUL_API_KEY;
            if (apiKey) {
              proxyReq.setHeader('Authorization', `Bearer ${apiKey}`);
            }
            proxyReq.setHeader('Content-Type', 'application/json');
          });
        },
      },
    },
  },
}));
