import resolve from 'rollup-plugin-node-resolve';
import typescript from 'rollup-plugin-typescript2';
import commonjs from 'rollup-plugin-commonjs';
import serve from 'rollup-plugin-serve';
import json from '@rollup/plugin-json';

export default {
  input: ['src/main.ts'],
  output: {
    file: './dist/mini-media-player-bundle.js',
    format: 'es',
    inlineDynamicImports: true,
  },
  plugins: [
    resolve(),
    commonjs(),
    typescript(),
    json(),
    serve({
      contentBase: './dist',
      host: '0.0.0.0',
      port: 5059,
      allowCrossOrigin: true,
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
    }),
  ],
};
