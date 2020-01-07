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
    };
  }

  get selectedId() {
    return this.items.map(item => item.id).indexOf(this.selected);
  }

  onChange(e) {
    const id = e.target.selected;
    if (id !== this.selectedId && this.items[id]) {
      this.dispatchEvent(new CustomEvent('change', {
        detail: this.items[id],
      }));
      e.target.selected = -1;
    }
  }

  render() {
    return html`
      <paper-menu-button
        class='mmp-dropdown'
        noink no-animations
        .horizontalAlign=${'right'}
        .verticalAlign=${'top'}
        .verticalOffset=${44}
        .dynamicAlign=${true}
        @click=${e => e.stopPropagation()}>
        ${this.icon ? html`
          <paper-icon-button
            class='mmp-dropdown__button icon'
            slot='dropdown-trigger'
            .icon=${ICON.DROPDOWN}>
          </paper-icon-button>
        ` : html`
          <mmp-button class='mmp-dropdown__button' slot='dropdown-trigger'>
            <div>
              <span class='mmp-dropdown__label ellipsis'>
                ${this.selected || this.label}
              </span>
              <iron-icon class='mmp-dropdown__icon' .icon=${ICON.DROPDOWN}></iron-icon>
            </div>
          </mmp-button>
        `}
        <paper-listbox slot="dropdown-content" .selected=${this.selectedId} @iron-select=${this.onChange}>
          ${this.items.map(item => html`
            <paper-item value=${item.id || item.name}>
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
          height: calc(var(--mmp-unit) * .6);
          width: calc(var(--mmp-unit) * .6);
          min-width: calc(var(--mmp-unit) * .6);
        }
        paper-item > *:nth-child(2) {
          margin-left: 4px;
        }
        paper-menu-button[focused] mmp-button iron-icon {
          color: var(--mmp-accent-color);
          transform: rotate(180deg);
        }
        paper-menu-button[focused] paper-icon-button {
          color: var(--mmp-accent-color);
          transform: rotate(180deg);
        }
        paper-menu-button[focused] paper-icon-button[focused] {
          color: var(--mmp-text-color);
          transform: rotate(0deg);
        }
      `,
    ];
  }
}

customElements.define('mmp-dropdown', MiniMediaPlayerDropdown);
