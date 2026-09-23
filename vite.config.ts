import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    // Only VITE_-prefixed values may be exposed to browser code. Backend-only
    // SUPABASE_SERVICE_ROLE_KEY values must never enter the client bundle.
    // The v0 Supabase integration injects non-prefixed vars; expose only the
    // public ones (URL + publishable key, including the _2 project pair).
    // SUPABASE_SECRET_KEY(_2) stays server-side.
    envPrefix: [
      'VITE_',
      'SUPABASE_URL',
      'SUPABASE_URL_2',
      'SUPABASE_PUBLISHABLE_KEY',
      'SUPABASE_PUBLISHABLE_KEY_2',
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
      host: '0.0.0.0',
      port: 3000,
      allowedHosts: true as const,
    },
  };
});
