import resolve from 'rollup-plugin-node-resolve';
import { terser } from 'rollup-plugin-terser';

export default {
  input: 'mini-media-player.js',
  output: {
    file: 'mini-media-player-bundle.js',
    format: 'umd',
  },
  plugins: [
    resolve(),
    terser(),
  ],
};
