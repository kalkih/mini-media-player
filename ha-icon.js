import { LitElement, css, svg } from 'lit-element';
import {
  mdiPower,
  mdiCast,
  mdiChevronDown,
  mdiSpeakerMultiple,
  mdiMenuDown,
  mdiVolumeOff,
  mdiVolumeHigh,
  mdiSkipNext,
  mdiPause,
  mdiPlay,
  mdiSkipPrevious,
  mdiSend,
  mdiShuffle,
  mdiRepeatOff,
  mdiRepeatOnce,
  mdiRepeat,
  mdiStop,
  mdiVolumePlus,
  mdiVolumeMinus,
  mdiFastForward,
  mdiRewind
} from './node_modules/@mdi/js';

const ICON = {
  'mdi:cast': mdiCast,
  'mdi:chevron-down': mdiChevronDown,
  'mdi:speaker-multiple': mdiSpeakerMultiple,
  'mdi:menu-down': mdiMenuDown,
  'mdi:volume-off': mdiVolumeOff,
  'mdi:volume-high': mdiVolumeHigh,
  'mdi:skip-next': mdiSkipNext,
  'mdi:pause': mdiPause,
  'mdi:play': mdiPlay,
  'mdi:power': mdiPower,
  'mdi:skip-previous': mdiSkipPrevious,
  'mdi:send': mdiSend,
  'mdi:shuffle': mdiShuffle,
  'mdi:repeat-off': mdiRepeatOff,
  'mdi:repeat-once': mdiRepeatOnce,
  'mdi:repeat': mdiRepeat,
  'mdi:stop': mdiStop,
  'mdi:volume-minus': mdiVolumeMinus,
  'mdi:volume-plus': mdiVolumePlus,
  'mdi:fast-forward': mdiFastForward,
  'mdi:rewind': mdiRewind,
}

class HaIcon extends LitElement {
  static get properties() {
    return {
      icon: {},
      shortcuts: {},
    };
  }

  render() {
    return svg`
      <svg 
        viewBox=${this.viewBox || '0 0 24 24'}
        preserveAspectRatio='xMidYMid meet'
        focusable='false'>
        <g>
          ${this.icon ? svg`<path d=${ICON[this.icon]}></path>` : ''}
        </g>
      </svg>`;
  }

  static get styles() {
    return css`
      :host {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        position: relative;
        vertical-align: middle;
      }
      svg {
        width: 100%;
        height: 100%;
        pointer-events: none;
        display: block;
        /* fill: currentcolor; */
        
        fill: var(--mmp-icon-color);
      }
    `;
  }
}

window.customElements.define('ha-icon', HaIcon);
