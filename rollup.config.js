import resolve from 'rollup-plugin-node-resolve';

export default {
  input: 'main.js',
  output: {
    file: 'mini-media-player-bundle.js',
    format: 'umd',
  },
  plugins: [
    resolve(),
  ],
};
