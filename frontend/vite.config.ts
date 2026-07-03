import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Docker + Windows bind mounts do not propagate inotify file events reliably.
 * Enable polling via CHOKIDAR_USEPOLLING=true (set in docker-compose.dev.yml).
 *
 * HMR WebSocket must target the host browser reaches (localhost), not the container hostname.
 * Configure with VITE_HMR_HOST (default: localhost).
 */
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const usePolling =
    process.env.CHOKIDAR_USEPOLLING === 'true' || env.CHOKIDAR_USEPOLLING === 'true';
  const hmrHost = process.env.VITE_HMR_HOST || env.VITE_HMR_HOST || 'localhost';
  const hmrPort = Number(
    process.env.VITE_HMR_PORT || env.VITE_HMR_PORT || env.FRONTEND_PORT || 5173,
  );

  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        '@app': path.resolve(__dirname, './src/app'),
        '@components': path.resolve(__dirname, './src/components'),
        '@features': path.resolve(__dirname, './src/features'),
        '@hooks': path.resolve(__dirname, './src/hooks'),
        '@layouts': path.resolve(__dirname, './src/layouts'),
        '@routes': path.resolve(__dirname, './src/routes'),
        '@services': path.resolve(__dirname, './src/services'),
        '@store': path.resolve(__dirname, './src/store'),
        '@app-types': path.resolve(__dirname, './src/types'),
        '@utils': path.resolve(__dirname, './src/utils'),
        '@constants': path.resolve(__dirname, './src/constants'),
        '@assets': path.resolve(__dirname, './src/assets'),
      },
    },
    server: {
      host: '0.0.0.0',
      port: 5173,
      strictPort: true,
      watch: usePolling
        ? {
            usePolling: true,
            interval: 1000,
          }
        : undefined,
      hmr: {
        host: hmrHost,
        port: hmrPort,
        clientPort: hmrPort,
      },
      proxy: {
        '/api': {
          target: env.VITE_API_PROXY_TARGET || 'http://localhost:8000',
          changeOrigin: true,
        },
      },
    },
    build: {
      outDir: 'dist',
      sourcemap: true,
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom', 'react-router-dom'],
            query: ['@tanstack/react-query'],
          },
        },
      },
    },
  };
});
