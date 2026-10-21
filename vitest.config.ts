import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
<<<<<<< Updated upstream
import { fileURLToPath } from 'node:url';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
=======
import path from 'path';

export default defineConfig({
  plugins: [react()],
>>>>>>> Stashed changes
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
<<<<<<< Updated upstream
    include: ['src/**/*.test.{ts,tsx}'],
    css: false,
=======
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    exclude: ['node_modules', '.next', 'dist'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
>>>>>>> Stashed changes
  },
});
