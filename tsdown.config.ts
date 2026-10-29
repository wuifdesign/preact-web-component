import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: './src/index.ts',
  platform: 'neutral',
  tsconfig: './tsconfig.app.json',
  format: {
    esm: {},
    cjs: {},
    umd: {
      // for <script> tags / CDNs, expects preact's UMD build (window.preact)
      globalName: 'PreactWebComponent',
      minify: true,
      dts: false,
      outputOptions: { globals: { preact: 'preact' } },
    },
  },
  dts: true,
  exports: true,
  // suggestions (e.g. engines.node) don't apply to a browser library, warnings fail the build
  publint: { level: 'warning', strict: true },
  attw: { profile: 'node16', level: 'error' },
})
