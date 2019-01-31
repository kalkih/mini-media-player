import resolve from 'rollup-plugin-node-resolve';
import { terser } from 'rollup-plugin-terser';

export default {
  input: 'main.js',
  output: {
    file: 'mini-media-player-bundle.js',
    format: 'umd',
  },
  plugins: [
    resolve(),
    terser(),
  ],
};
