import path from 'path';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

import runtimeErrorOverlay from '@replit/vite-plugin-runtime-error-modal';

// Vite's dev/preview servers (used by the Replit workflow) must bind to the
// PORT Replit assigns, and be served from Replit's artifact base path, so
// both are required when actually starting a server. A production
// `vite build` (e.g. on Vercel) never starts a server from this config, so
// neither is needed there — fall back to safe defaults instead of failing
// the build. Vercel serves the app from the domain root, so "/" is correct.
const DEFAULT_PORT = 5000;
const DEFAULT_BASE_PATH = '/';

export default defineConfig(async ({ command }) => {
  const isServeCommand = command === 'serve';
  const rawPort = process.env.PORT;
  const rawBasePath = process.env.BASE_PATH;

  if (isServeCommand && !rawPort) {
    throw new Error(
      'PORT environment variable is required but was not provided.',
    );
  }

  if (isServeCommand && !rawBasePath) {
    throw new Error(
      'BASE_PATH environment variable is required but was not provided.',
    );
  }

  const port = rawPort !== undefined ? Number(rawPort) : DEFAULT_PORT;

  if (Number.isNaN(port) || port <= 0) {
    throw new Error(`Invalid PORT value: "${rawPort}"`);
  }

  const basePath = rawBasePath || DEFAULT_BASE_PATH;

  return {
    base: basePath,
    plugins: [
      react(),
      tailwindcss(),
      runtimeErrorOverlay(),
      ...(process.env.NODE_ENV !== 'production' &&
      process.env.REPL_ID !== undefined
        ? [
            await import('@replit/vite-plugin-cartographer').then((m) =>
              m.cartographer({
                root: path.resolve(import.meta.dirname, '..'),
              }),
            ),
            await import('@replit/vite-plugin-dev-banner').then((m) =>
              m.devBanner(),
            ),
          ]
        : []),
    ],
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname, 'src'),
        '@assets': path.resolve(
          import.meta.dirname,
          '..',
          '..',
          'attached_assets',
        ),
      },
      dedupe: ['react', 'react-dom'],
    },
    root: path.resolve(import.meta.dirname),
    build: {
      outDir: path.resolve(import.meta.dirname, 'dist/public'),
      emptyOutDir: true,
    },
    server: {
      port,
      strictPort: true,
      host: '0.0.0.0',
      allowedHosts: true,
      fs: {
        strict: true,
      },
    },
    preview: {
      port,
      host: '0.0.0.0',
      allowedHosts: true,
    },
  };
});
