import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
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
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : { ignored: ['**/.firebase/**'] },
    },
  };
});
