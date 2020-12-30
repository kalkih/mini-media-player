import { MiniMediaPlayer } from './src/MiniMediaPlayer.js';
// import MiniMediaPlayerEditor from './src/MiniMediaPlayerEditor.js';

window.customElements.define('mini-media-player', MiniMediaPlayer);
// window.customElements.define('mini-media-player-editor', MiniMediaPlayerEditor);

// Configures the preview in the Lovelace card picker
window.customCards = window.customCards || [];
window.customCards.push({
  type: 'mini-media-player',
  name: 'Mini Media Player',
  preview: false,
  description: 'A minimalistic yet customizable media player card',
});
