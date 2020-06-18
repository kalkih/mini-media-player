const path = require('path');

module.exports = {
  entry: './src/main.js',
  mode: 'production',
  output: {
    filename: 'dist/mini-media-player-bundle.js',
    path: path.resolve(__dirname),
    libraryTarget: 'umd',
  },
  optimization: {
    minimize: true,
  },
};
