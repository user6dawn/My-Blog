import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    headers: {
      // Important for CORS when fetching images for sharing
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp',
    },
  },
  build: {
    assetsInlineLimit: 4096, // Keep this balanced for image handling
  },
  optimizeDeps: {
    // No need to exclude lucide-react unless you have specific issues
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'react-helmet-async',
      '@supabase/supabase-js'
    ],
  },
});