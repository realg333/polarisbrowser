import { defineConfig, externalizeDepsPlugin } from 'electron-vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin({ exclude: ['@polaris/shared'] })],
    resolve: {
      alias: {
        '@main': resolve('src/main'),
        '@polaris/shared': resolve('../../packages/shared/src/index.ts'),
      },
    },
  },
  preload: {
    plugins: [externalizeDepsPlugin({ exclude: ['@polaris/shared'] })],
    resolve: {
      alias: {
        '@polaris/shared': resolve('../../packages/shared/src/index.ts'),
      },
    },
  },
  renderer: {
    resolve: {
      alias: {
        '@': resolve('src/renderer'),
        '@polaris/shared': resolve('../../packages/shared/src/index.ts'),
      },
    },
    plugins: [react()],
  },
});
