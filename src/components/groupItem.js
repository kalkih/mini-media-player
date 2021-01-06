import { LitElement, html, css } from 'lit-element';

import t from '../utils/translation';

import './checkbox';

class MiniMediaPlayerGroupItem extends LitElement {
  static get properties() {
    return {
      hass: {},
      item: {},
      checked: Boolean,
      disabled: Boolean,
      master: Boolean,
    };
  }

  render() {
    return html`
      <mmp-checkbox
        .checked=${this.checked}
        .disabled=${this.disabled}
        @change='${e => e.stopPropagation()}'
        @click='${this.handleClick}'>
          ${this.item.name}
          ${this.master ? html`<span class="master">(${t(this.hass, 'label.master')})</span>` : ''}
      </mmp-checkbox>
    `;
  }

  handleClick(ev) {
    ev.stopPropagation();
    ev.preventDefault();
    if (this.disabled) return;
    this.dispatchEvent(new CustomEvent('change', {
      detail: {
        entity: this.item.entity_id,
        checked: !this.checked,
      },
    }));
  }

  static get styles() {
    return css`
      .master {
        font-weight: 500;
      }
    `;
  }
}

customElements.define('mmp-group-item', MiniMediaPlayerGroupItem);
