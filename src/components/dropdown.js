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

  connectedCallback() {
    super.connectedCallback();
    this._handleDocumentClick = this.handleDocumentClick.bind(this);
    document.addEventListener('click', this._handleDocumentClick);
  }

  disconnectedCallback() {
    document.removeEventListener('click', this._handleDocumentClick);
    super.disconnectedCallback();
  }

  get selectedIndex() {
    return this.items.map(item => item.id).indexOf(this.selected);
  }

  get hasLegacyMenu() {
    return Boolean(customElements.get('mwc-menu') && customElements.get('mwc-list-item'));
  }

  firstUpdated() {
    if (!this.hasLegacyMenu) return;
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
        ${this.hasLegacyMenu
          ? html`<mwc-menu
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
            </mwc-menu>`
          : html`<div class='mmp-dropdown__menu' ?open=${this.isOpen}>
              ${this.items.map((item, index) => html`
                <button
                  class='mmp-dropdown__item'
                  type='button'
                  ?selected=${index === this.selectedIndex}
                  @click=${e => this.onFallbackSelect(e, index)}>
                  ${item.icon ? html`<ha-icon .icon=${item.icon}></ha-icon>` : ''}
                  ${item.name ? html`<span class='mmp-dropdown__item__label'>${item.name}</span>` : ''}
                </button>`)}
            </div>`}
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
    if (this.hasLegacyMenu) {
      const menu = this.shadowRoot.querySelector('#menu');
      menu.open = !menu.open;
      this.isOpen = menu.open;
    } else {
      this.isOpen = !this.isOpen;
    }
  }

  onFallbackSelect(e, index) {
    e.stopPropagation();
    const item = this.items[index];
    this.isOpen = false;
    if (!item || index === this.selectedIndex) return;
    this.dispatchEvent(new CustomEvent('change', {
      detail: item,
    }));
  }

  handleDocumentClick(e) {
    if (!this.isOpen) return;
    const path = e.composedPath ? e.composedPath() : [];
    if (!path.includes(this)) this.isOpen = false;
  }

  static get styles() {
    return [
      sharedStyle,
      css`
        :host {
          display: block;
          min-width: 0;
          max-width: 100%;
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
          min-width: 0;
          max-width: 100%;
        }
        .mmp-dropdown__menu {
          position: absolute;
          right: 0;
          top: calc(100% + 2px);
          min-width: 140px;
          max-width: 240px;
          max-height: 320px;
          overflow-y: auto;
          border-radius: 8px;
          background: var(--card-background-color, var(--ha-card-background, #fff));
          box-shadow: var(--ha-card-box-shadow, 0 2px 6px rgba(0, 0, 0, 0.25));
          padding: 4px;
          z-index: 1000;
          display: none;
        }
        .mmp-dropdown__menu[open] {
          display: block;
        }
        .mmp-dropdown__item {
          align-items: center;
          background: transparent;
          border: 0;
          border-radius: 6px;
          color: inherit;
          cursor: pointer;
          display: flex;
          font: inherit;
          gap: 8px;
          min-height: calc(var(--mmp-unit) * 0.8);
          padding: 0 10px;
          text-align: left;
          width: 100%;
        }
        .mmp-dropdown__item[selected],
        .mmp-dropdown__item:hover {
          background: rgba(127, 127, 127, 0.15);
        }
        .mmp-dropdown__item__label {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .mmp-dropdown__button {
          display: flex;
          font-size: 1em;
          justify-content: space-between;
          align-items: center;
          height: calc(var(--mmp-unit) - 4px);
          margin: 2px 0;
          max-width: 100%;
          min-width: 0;
        }
        .mmp-dropdown__button:not(.icon) {
          width: 100%;
          overflow: hidden;
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
          min-width: 0;
        }
        .mmp-dropdown__label {
          display: block;
          min-width: 0;
          max-width: 100%;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
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
