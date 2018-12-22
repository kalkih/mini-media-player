import replace from 'rollup-plugin-replace';
import resolve from 'rollup-plugin-node-resolve';
import { terser } from "rollup-plugin-terser";

export default {
  input: 'mini-media-player.js',
  output: {
    file: 'mini-media-player-bundle.js',
    format: 'umd'
  },
  plugins: [
    replace({
      include: 'mini-media-player.js',
      'https://unpkg.com/@polymer/lit-element@^0.6.3/lit-element.js?module': '@polymer/lit-element',
      'https://cdn.jsdelivr.net/npm/resize-observer-polyfill@1.5.1/dist/ResizeObserver.es.js': 'resize-observer-polyfill'
    }),
    resolve(),
    terser()
  ]
};
