import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv, type Plugin} from 'vite';
import {planActions} from './api/needle-core.mjs';

/**
 * Dev-only middleware mirroring api/needle.js so the AI planner works in the
 * preview too. In production the Vercel serverless function serves /api/needle.
 */
function needleDevApi(apiKey: string | undefined): Plugin {
  return {
    name: 'needle-dev-api',
    configureServer(server) {
      server.middlewares.use('/api/needle', (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.end(JSON.stringify({detail: 'Method not allowed'}));
          return;
        }
        if (!apiKey) {
          res.statusCode = 503;
          res.end(JSON.stringify({detail: 'AI Gateway is not configured'}));
          return;
        }
        let body = '';
        req.on('data', (chunk) => {
          body += chunk;
        });
        req.on('end', async () => {
          try {
            const {prompt, history} = JSON.parse(body || '{}');
            if (!prompt || typeof prompt !== 'string' || prompt.length > 4000) {
              res.statusCode = 400;
              res.end(JSON.stringify({detail: 'A prompt of at most 4000 characters is required'}));
              return;
            }
            const plan = await planActions(prompt, history, apiKey);
            res.statusCode = 200;
            res.end(JSON.stringify(plan));
          } catch {
            res.statusCode = 502;
            res.end(JSON.stringify({detail: 'AI Gateway request failed'}));
          }
        });
      });
    },
  };
}

export default defineConfig(({mode}) => {
  // Load the full env (including non-VITE_ server vars) for the dev middleware.
  const env = loadEnv(mode, __dirname, '');
  return {
    plugins: [react(), tailwindcss(), needleDevApi(env.AI_GATEWAY_API_KEY)],
    // Only VITE_-prefixed values may be exposed to browser code. Backend-only
    // SUPABASE_SERVICE_ROLE_KEY values must never enter the client bundle.
    // The v0 Supabase integration injects non-prefixed vars; expose only the
    // public ones (URL + publishable key).
    // SUPABASE_SECRET_KEY stays server-side.
    envPrefix: [
      'VITE_',
      'SUPABASE_URL',
      'SUPABASE_PUBLISHABLE_KEY',
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
