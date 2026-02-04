import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'foodmatrixkrishna.netlify',
        short_name: 'FoodMatrix',
        description: 'Food Matrix Krishna PWA',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'any',
        scope: '/',
        start_url: '/', // Fixed: This must be '/' to load your site
        icons: [
          {
            src: 'https://i.ibb.co/JW2jFp15/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'https://i.ibb.co/JW2jFp15/pwa-192x192.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
  base: './',
  build: {
    outDir: 'dist',
  },
});
