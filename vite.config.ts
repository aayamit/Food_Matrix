import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // 'base: "./"' is CRITICAL for Capacitor apps to load assets correctly
  base: './',
  build: {
    outDir: 'dist',
  },
});