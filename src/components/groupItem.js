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
        <span>
          ${this.item.name}
          ${this.master ? html`<span>(${t(this.hass, 'label.master')})</span>` : ''}
        </span>
      </mmp-checkbox>
    `;
  }

  handleClick(ev) {
    ev.stopPropagation();
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
      paper-checkbox {
        padding: 8px 0;
      }
      paper-checkbox > span {
        font-weight: 600;
        text-transform: lowercase;
      }

      ha-card[artwork*='cover'][has-artwork] paper-checkbox[disabled] {
        --paper-checkbox-checkmark-color: rgba(0,0,0,.5);
      }
      ha-card[artwork*='cover'][has-artwork] paper-checkbox {
        --paper-checkbox-unchecked-color: #FFFFFF;
        --paper-checkbox-label-color: #FFFFFF;
      }
    `;
  }
}

customElements.define('mmp-group-item', MiniMediaPlayerGroupItem);
