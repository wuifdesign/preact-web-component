import { preact } from '@preact/preset-vite'
import { visualizer } from 'rollup-plugin-visualizer'
import dts from 'vite-plugin-dts'
import { defineConfig } from 'vitest/config'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    preact(),
    dts({
      tsconfigPath: './tsconfig.app.json',
      include: ['src/index.ts', 'src/lib/register.ts', 'src/types/web-component-props.ts'],
    }),
    visualizer(),
  ],
  build: {
    lib: {
      entry: './src/index.ts',
    },
    rollupOptions: {
      external: ['preact'],
      output: [
        {
          format: 'es',
          globals: {
            preact: 'Preact',
          },
          entryFileNames: 'index.es.js',
        },
        {
          format: 'umd',
          globals: {
            preact: 'Preact',
          },
          name: 'PreactWebComponents',
          entryFileNames: 'index.min.js',
        },
      ],
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
  },
})
