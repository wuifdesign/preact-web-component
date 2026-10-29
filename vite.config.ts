import { preact } from '@preact/preset-vite'
import { defineConfig } from 'vitest/config'

// Used for the demo dev server and tests, the library is built with tsdown (see tsdown.config.ts)
// https://vite.dev/config/
export default defineConfig({
  plugins: [preact()],
  test: {
    globals: true,
    environment: 'jsdom',
    // loaded here instead of imported in tests, so its global types don't override lib.dom's ElementInternals
    setupFiles: ['element-internals-polyfill'],
  },
})
