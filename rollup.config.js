import resolve from 'rollup-plugin-node-resolve';

export default {
  input: 'src/main.js',
  output: {
    file: 'dist/mini-media-player-bundle.js',
    format: 'umd',
    name: 'MiniMediaPlayer',
  },
  plugins: [
    resolve(),
  ],
};
