import { LitElement, html, css } from 'lit-element';

import './dropdown';

class MiniMediaPlayerSourceMenu extends LitElement {
  static get properties() {
    return {
      player: {},
      icon: Boolean,
    };
  }

  get source() {
    return this.player.source;
  }

  get sources() {
    return this.player.sources.map(source => ({
      name: source,
      id: source,
      type: 'source',
    }));
  }

  render() {
    return html`
      <mmp-dropdown
        @change=${this.handleSource}
        .items=${this.sources}
        .label=${this.source}
        .selected=${this.source}
        .icon=${this.icon}
      ></mmp-dropdown>
    `;
  }

  handleSource(ev) {
    const { id } = ev.detail;
    this.player.setSource(ev, id);
  }

  static get styles() {
    return css`
      :host {
        max-width: 120px;
        min-width: 40px;
      }
      :host([full]) {
        max-width: none;
      }
    `;
  }
}

customElements.define('mmp-source-menu', MiniMediaPlayerSourceMenu);
