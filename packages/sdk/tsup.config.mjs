/* eslint-disable import/no-extraneous-dependencies */
import { defineConfig } from 'tsup';

export default defineConfig({
  treeshake: true,
  minify: false,
  dts: true,
  format: ['cjs', 'esm'],
  entry: {
    swap: 'src/swap/index.ts',
    types: 'src/swap/types/index.ts',
  },
});
