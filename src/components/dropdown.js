import { LitElement, html, css } from 'lit-element';

import { ICON } from '../const';

import sharedStyle from '../sharedStyle';

class MiniMediaPlayerDropdown extends LitElement {
  static get properties() {
    return {
      items: [],
      label: String,
      selected: String,
    };
  }

  get selectedId() {
    return this.items.map(item => item.id).indexOf(this.selected);
  }

  onChange(item) {
    this.dispatchEvent(new CustomEvent('change', {
      detail: item,
    }));
  }

  render() {
    return html`
      <paper-menu-button
        class='mmp-dropdown'
        noink no-animations
        .horizontalAlign=${'right'}
        .verticalAlign=${'top'}
        .verticalOffset=${44}
        @click=${e => e.stopPropagation()}>
        ${this.icon ? html`
          <paper-icon-button
            class='mmp-dropdown__button icon'
            slot='dropdown-trigger'
            .icon=${ICON.DROPDOWN}>
          </paper-icon-button>
        ` : html`
          <mwc-button class='mmp-dropdown__button' slot='dropdown-trigger'>
            <div>
              <span class='mmp-dropdown__label ellipsis'>
                ${this.selected || this.label}
              </span>
              <iron-icon class='mmp-dropdown__icon' .icon=${ICON.DROPDOWN}></iron-icon>
            </div>
          </mwc-button>
        `}
        <paper-listbox slot="dropdown-content" selected=${this.selectedId}>
          ${this.items.map(item => html`
            <paper-item
              value=${item.id || item.name}
              @click=${() => this.onChange(item)}>
              ${item.icon ? html`<iron-icon .icon=${item.icon}></iron-icon>` : ''}
              ${item.name ? html`<span class='mmp-dropdown__item__label'>${item.name}</span>` : ''}
            </paper-item>`)}
        </paper-listbox>
      </paper-menu-button>
    `;
  }

  static get styles() {
    return [
      sharedStyle,
      css`
        :host {
          display: block;
        }
        :host([faded]) mwc-button {
          opacity: .75;
        }
        .mmp-dropdown {
          padding: 0;
          display: block;
        }
        .mmp-dropdown__button {
          display: flex;
          font-size: 1em;
          justify-content: space-between;
          align-items: center;
          height: 36px;
          margin: 2px 0;
        }
        .mmp-dropdown__button.icon {
          height: 40px;
          margin: 0;
        }
        .mmp-dropdown__button > div {
          display: flex;
          flex: 1;
          justify-content: space-between;
          align-items: center;
          height: 36px;
          max-width: 100%;
        }
        .mmp-dropdown__label {
          text-align: left;
          text-transform: none;
        }
        .mmp-dropdown__icon {
          height: 24px;
          width: 24px;
          min-width: 24px;
        }
        paper-item > *:nth-child(2) {
          margin-left: 4px;
        }

        paper-menu-button[focused] mwc-button > div > iron-icon,
        paper-menu-button[focused] paper-icon-button {
          color: var(--mmp-accent-color);
          transform: rotate(180deg);
        }
        paper-menu-button mwc-button:focus > div > iron-icon,
        paper-menu-button mwc-button[focused] > div > iron-icon,
        paper-menu-button[focused] paper-icon-button[focused] {
          color: var(--mmp-text-color);
          transform: rotate(0deg);
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
      `,
    ];
  }
}

customElements.define('mmp-dropdown', MiniMediaPlayerDropdown);
