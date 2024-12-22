import { defineConfig } from 'vite'

export default defineConfig({
  root: __dirname,
  plugins: [],
  envPrefix: 'WT',
  clearScreen: false,
  base: "./",
  build: {
    outDir: './dist/',
    target: 'esnext',
    minify: 'esbuild',
    reportCompressedSize: true,
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },
});
