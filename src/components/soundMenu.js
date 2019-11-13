import { LitElement, html, css } from 'lit-element';

import './dropdown';

class MiniMediaPlayerSoundMenu extends LitElement {
  static get properties() {
    return {
      player: {},
      selected: String,
      icon: Boolean,
    };
  }

  get mode() {
    return this.player.soundMode;
  }

  get modes() {
    return this.player.soundModes.map(mode => ({
      name: mode,
      id: mode,
      type: 'soundMode',
    }));
  }

  render() {
    return html`
      <mmp-dropdown
        @change=${this.handleChange}
        .items=${this.modes}
        .label=${this.mode}
        .selected=${this.selected || this.mode}
        .icon=${this.icon}
      ></mmp-dropdown>
    `;
  }

  handleChange(ev) {
    const { id } = ev.detail;
    this.player.setSoundMode(ev, id);
    this.selected = id;
  }

  static get styles() {
    return css`
      :host {
        max-width: 120px;
        min-width: var(--mmp-unit);
      }
      :host([full]) {
        max-width: none;
      }
    `;
  }
}

customElements.define('mmp-sound-menu', MiniMediaPlayerSoundMenu);
