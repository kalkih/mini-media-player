import { LitElement, html, css } from 'lit-element';

import { ICON } from '../const';
import sharedStyle from '../sharedStyle';
import './button';

class MiniMediaPlayerDropdown extends LitElement {
  static get properties() {
    return {
      items: [],
      label: String,
      selected: String,
      id: String,
      isOpen: Boolean,
    };
  }

  get selectedIndex() {
    return this.items.map(item => item.id).indexOf(this.selected);
  }

  firstUpdated() {
    const menu = this.shadowRoot.querySelector('#menu');
    const button = this.shadowRoot.querySelector('#button');
    menu.anchor = button;
  }

  render() {
    return html`
      <div
        class='mmp-dropdown'
        @click=${e => e.stopPropagation()}
        ?open=${this.isOpen}>
        ${this.icon ? html`
          <ha-icon-button
            id='button'
            class='mmp-dropdown__button icon'
            .icon=${ICON.DROPDOWN}
            @click=${this.toggleMenu}>
            <ha-icon .icon=${ICON.DROPDOWN}></ha-icon>
          </ha-icon-button>
        ` : html`
          <mmp-button id='button' class='mmp-dropdown__button' 
            @click=${this.toggleMenu}>
            <div>
              <span class='mmp-dropdown__label ellipsis'>
                ${this.selected || this.label}
              </span>
              <ha-icon class='mmp-dropdown__icon' .icon=${ICON.DROPDOWN}></ha-icon>
            </div>
          </mmp-button>
        `}
        <mwc-menu
          @closed=${this.handleClose}
          @selected=${this.onChange}
          activatable
          id='menu'
          corner='BOTTOM_RIGHT'
          menuCorner='END'>
          ${this.items.map(item => html`
            <mwc-list-item value=${item.id || item.name}>
              ${item.icon ? html`<ha-icon .icon=${item.icon}></ha-icon>` : ''}
              ${item.name ? html`<span class='mmp-dropdown__item__label'>${item.name}</span>` : ''}
            </mwc-list-item>`)}
        </mwc-menu>
      </div>
    `;
  }

  onChange(e) {
    const { index } = e.detail;
    if (index !== this.selectedIndex && this.items[index]) {
      this.dispatchEvent(new CustomEvent('change', {
        detail: this.items[index],
      }));
    }
  }

  handleClose(e) {
    e.stopPropagation();
    this.isOpen = false;
  }

  toggleMenu() {
    const menu = this.shadowRoot.querySelector('#menu');
    menu.open = !menu.open;
    this.isOpen = menu.open;
  }

  static get styles() {
    return [
      sharedStyle,
      css`
        :host {
          display: block;
        }
        :host([faded]) {
          opacity: .75;
        }
        :host[small] .mmp-dropdown__label {
          max-width: 60px;
          display: block;
          position: relative;
          width: auto;
          text-transform: initial;
        }
        :host[full] .mmp-dropdown__label {
          max-width: none;
        }
        .mmp-dropdown {
          padding: 0;
          display: block;
          position: relative;
        }
        .mmp-dropdown__button {
          display: flex;
          font-size: 1em;
          justify-content: space-between;
          align-items: center;
          height: calc(var(--mmp-unit) - 4px);
          margin: 2px 0;
        }
        .mmp-dropdown__button.icon {
          height: var(--mmp-unit);
          margin: 0;
        }
        .mmp-dropdown__button > div {
          display: flex;
          flex: 1;
          justify-content: space-between;
          align-items: center;
          height: calc(var(--mmp-unit) - 4px);
          max-width: 100%;
        }
        .mmp-dropdown__label {
          text-align: left;
          text-transform: none;
        }
        .mmp-dropdown__icon {
          height: auto;
          width: calc(var(--mmp-unit) * .6);
          min-width: calc(var(--mmp-unit) * .6);
        }
        mwc-list-item > *:nth-child(2) {
          margin-left: 4px;
        }
        .mmp-dropdown[open] mmp-button ha-icon {
          color: var(--mmp-accent-color);
          transform: rotate(180deg);
        }
        .mmp-dropdown[open] mmp-icon-button {
          color: var(--mmp-accent-color);
          transform: rotate(180deg);
        }
        .mmp-dropdown[open] mmp-icon-button[focused] {
          color: var(--mmp-text-color);
          transform: rotate(0deg);
        }
      `,
    ];
  }
}

customElements.define('mmp-dropdown', MiniMediaPlayerDropdown);
