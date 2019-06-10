import { LitElement, html, css } from 'lit-element';

import './dropdown';
import './button';

import sharedStyle from '../sharedStyle';

class MiniMediaPlayerShortcuts extends LitElement {
  static get properties() {
    return {
      player: {},
      shortcuts: {},
    };
  }

  get buttons() {
    return this.shortcuts.buttons;
  }

  get list() {
    return this.shortcuts.list;
  }

  get show() {
    return (!this.shortcuts.hide_when_off || this.player.active);
  }

  get active() {
    return this.player.getAttribute(this.shortcuts.attribute);
  }

  render() {
    if (!this.show) return html``;
    const { active } = this;

    const list = this.list ? html`
      <mmp-dropdown class='mmp-shortcuts__dropdown'
        @change=${this.handleShortcut}
        .items=${this.list}
        .label=${this.shortcuts.label}
        .selected=${active}>
      </mmp-dropdown>
    ` : '';

    const buttons = this.buttons ? html`
      <div class='mmp-shortcuts__buttons'>
        ${this.buttons.map(item => html`
          <mmp-button
            raised
            columns=${this.shortcuts.columns}
            ?color=${item.id === active}
            class='mmp-shortcuts__button'
            @click=${e => this.handleShortcut(e, item)}>
            ${item.icon ? html`<iron-icon .icon=${item.icon}></iron-icon>` : ''}
            ${item.name ? html`<span class="ellipsis">${item.name}</span>` : ''}
          </mmp-button>`)}
      </div>
    ` : '';

    return html`
      ${buttons}
      ${list}
    `;
  }

  handleShortcut(ev, item) {
    const { type, id, data } = item || ev.detail;
    if (type === 'source')
      return this.player.setSource(ev, id);
    if (type === 'script')
      return this.player.toggleScript(ev, id, data);
    if (type === 'sound_mode')
      return this.player.setSoundMode(ev, id);
    const options = {
      media_content_type: type,
      media_content_id: id,
    };
    this.player.setMedia(ev, options);
  }

  static get styles() {
    return [
      sharedStyle,
      css`
        .mmp-shortcuts__buttons {
          box-sizing: border-box;
          display: flex;
          flex-wrap: wrap;
          margin-top: 8px;
        }
        .mmp-shortcuts__button[color] {
          background: var(--mmp-active-color);
        }
        .mmp-shortcuts__button {
          min-width: calc(50% - 8px);
          flex: 1;
        }
        .mmp-shortcuts__button[columns='1'] {
          min-width: calc(100% - 8px);
        }
        .mmp-shortcuts__button[columns='3'] {
          min-width: calc(33.33% - 8px);
        }
        .mmp-shortcuts__button[columns='4'] {
          min-width: calc(25% - 8px);
        }
        .mmp-shortcuts__button[columns='5'] {
          min-width: calc(20% - 8px);
        }
        .mmp-shortcuts__button > span {
          line-height: 24px;
          text-transform: initial;
        }
        .mmp-shortcuts__button > *:nth-child(2) {
          margin-left: 4px;
        }
      `,
    ];
  }
}

customElements.define('mmp-shortcuts', MiniMediaPlayerShortcuts);
