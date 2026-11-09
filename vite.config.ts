/// <reference types="vitest/config" />
import { resolve } from 'node:path'
import { configDefaults } from 'vitest/config'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/',
  plugins: [react()],
  build: {
    rollupOptions: {
      // One HTML entry per page so GitHub Pages can serve each URL directly.
      input: {
        main: resolve(__dirname, 'index.html'),
        blog: resolve(__dirname, 'blog/index.html'),
        'blog-portfolio': resolve(__dirname, 'blog/building-a-portfolio-that-looks-back/index.html'),
      },
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['src/test/setup.ts'],
    // Browser tests run with Playwright (`npm run e2e`).
    exclude: [...configDefaults.exclude, 'e2e/**'],
  },
})
