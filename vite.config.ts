const { resolve } = require('path');
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import alias from '@rollup/plugin-alias';
const path = require('path');

export default defineConfig({
  root: '',
  plugins: [
    react({
      exclude: ['src'],
      include: 'webviews/*.tsx',
    }),
    alias({
      entries: {
        '@components': path.resolve(__dirname, './webviews/components'),
        '@pages': path.resolve(__dirname, './webviews/pages'),
      },
    }),
  ],

  build: {
    rollupOptions: {
      input: {
        Sidebar: resolve(__dirname, 'webviews/pages/Sidebar.tsx'),
        MacroPlayer: resolve(__dirname, 'webviews/pages/MacroPlayer.tsx'),
        StopPoints: resolve(__dirname, 'webviews/pages/StopPoints.tsx'),
        styles: resolve(__dirname, 'media/vscode.css'),
      },
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: '[name].js',
        assetFileNames: '[name].[ext]',
      },
      external: ['vscode'],
    },
    outDir: 'out',
    sourcemap: true,
  },
});
