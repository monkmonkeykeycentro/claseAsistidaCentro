import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';
import { publicEnvironment, validateProductionEnvironment } from './scripts/public-environment.mjs';

export default defineConfig(({ mode, command }) => {
  const environment = { ...loadEnv(mode, process.cwd(), ''), ...process.env };
  if (command === 'build') validateProductionEnvironment(environment);
  return {
    envPrefix: [],
    define: Object.fromEntries(Object.entries(publicEnvironment(environment)).map(([key, value]) => [`import.meta.env.${key}`, JSON.stringify(value)])),
    build: { sourcemap: false },
    plugins: [react(), tailwindcss()],
    resolve: {
      // The editor and its extensions must share the same selection registry.
      dedupe: ['react', 'react-dom', '@tiptap/core', '@tiptap/pm', 'prosemirror-state', 'prosemirror-model', 'prosemirror-transform', 'prosemirror-view', 'prosemirror-gapcursor'],
      alias: {
        '@': path.resolve(import.meta.dirname, '.'),
      },
    },
    optimizeDeps: {
      // Pre-bundle the lazy editor together. Keep GapCursor in its own shared
      // dependency so refreshing StarterKit cannot register its JSON ID twice.
      include: ['@tiptap/react', '@tiptap/starter-kit', '@tiptap/extension-text-style', '@tiptap/extension-text-align', '@tiptap/pm/gapcursor'],
    },
    server: {
      proxy: { '/api': { target: `http://127.0.0.1:${environment.API_PORT || '3002'}`, changeOrigin: true } },
      port: 3000,
      host: '0.0.0.0',
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : { ignored: ['**/.firebase/**'] },
    },
  };
});
