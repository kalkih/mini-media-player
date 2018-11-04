import cleanup from 'rollup-plugin-cleanup';
import replace from 'rollup-plugin-replace';
import resolve from 'rollup-plugin-node-resolve';
import { terser } from "rollup-plugin-terser";

export default {
  input: 'mini-media-player.js',
  output: {
    file: 'mini-media-player-bundle.js',
    format: 'esm'
  },
  plugins: [
    replace({
      include: 'mini-media-player.js',
      'https://unpkg.com/@polymer/lit-element@^0.6.2/lit-element.js?module': '@polymer/lit-element'
    }),
    resolve(),
    cleanup({comments: 'none'}),
    terser()
  ]
};
