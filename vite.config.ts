import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@server": path.resolve(__dirname, "../server/src"),
    },
  },
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/api/v1': {
        target: loadEnv('', process.cwd()).VITE_API_URL as string,
        changeOrigin: true,
          secure: false,      
          ws: true,
          configure: (proxy) => {
            proxy.on('error', (err) => {
              console.log('proxy error', err);
            });
            proxy.on('proxyReq', (_, req) => {
              console.log('Sending Request to the Target:', req.method, req.url);
            });
            proxy.on('proxyRes', (proxyRes, req) => {
              console.log('Received Response from the Target:', proxyRes.statusCode, req.url);
            });
          },
      },
      '/oauth2': {
        target: loadEnv('', process.cwd()).VITE_API_URL as string,
        changeOrigin: true,
        secure: false,
      },
      '/login/oauth2': {
        target: loadEnv('', process.cwd()).VITE_API_URL as string,
        changeOrigin: true,
        secure: false,
      }
    }
  }
})
