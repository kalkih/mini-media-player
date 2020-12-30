import { LitElement, html, css } from 'lit-element';

class MiniMediaPlayerVolumeSlider extends LitElement {
  constructor() {
    super();
    this.min = 0;
    this.max = 100;
    this.step = 1;
  }

  static get properties() {
    return {
      player: {},
      min: Number,
      max: Number,
      step: Number,
    };
  }

  get vol() {
    return Math.round(this.player.vol * 100);
  }

  get muted() {
    return this.player.muted;
  }

  render() {
    return html`
      <ha-slider
        @change=${this.handleVolumeChange}
        @click=${e => e.stopPropagation()}
        ?disabled=${this.muted}
        min=${this.min} max=${this.max}
        value=${this.player.vol * 100}
        step=${this.step}
        dir=${'ltr'}
        ignore-bar-touch pin>
      </ha-slider>
    `;
  }

  handleVolumeChange(ev) {
    const vol = parseFloat(ev.target.value) / 100;
    this.player.setVolume(ev, vol);
  }

  static get styles() {
    return css`
      ha-slider {
        max-width: none;
        min-width: 100px;
        width: 100%;
        --paper-slider-active-color: var(--mmp-accent-color);
        --paper-slider-knob-color: var(--mmp-accent-color);
      }
    `;
  }
}

customElements.define('mmp-volume-slider', MiniMediaPlayerVolumeSlider);
