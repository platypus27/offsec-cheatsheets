import { resolve } from 'node:path'
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { viteSingleFile } from 'vite-plugin-singlefile'

// The build inlines every script, style and font into one dist/index.html so
// the cheatsheet opens straight from disk (file://) with no server - module
// chunks are blocked on file:// origins, a single inlined bundle is not.
export default defineConfig({
  plugins: [react(), viteSingleFile()],
  base: './',
  resolve: {
    dedupe: ['react', 'react-dom'],
    alias: { '@content': resolve(import.meta.dirname, process.env.CHEATSHEET_CONTENT ?? 'content') },
  },
  server: { port: 4320, strictPort: true },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
  },
})
