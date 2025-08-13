import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
   base: process.env.NODE_ENV === 'production'
    ? '/light-spot-home/'   // 项目站点
    : '/'                // 个人站点
    ,
  plugins: [
    vue(),
    vueDevTools(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  server: {
    host: '127.0.0.1',
    proxy: {
      '/eve-images': {
        target: 'https://images.evetech.net',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/eve-images/, ''),
        configure: (proxy, options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('Proxy error:', err);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('Request sent to EVE images:', req.method, req.url);
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('Response from EVE images:', proxyRes.statusCode, req.url);
          });
        },
      },
    },
  },
})
