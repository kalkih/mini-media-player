import { LitElement, html, css } from 'lit-element';
import { styleMap } from 'lit-html/directives/style-map';

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
    return (!this.shortcuts.hide_when_off || this.player.isActive);
  }

  get active() {
    return this.player.getAttribute(this.shortcuts.attribute);
  }

  get height() {
    return this.shortcuts.column_height || 36;
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
            style="${styleMap(this.shortcutStyle(item))}"
            raised
            columns=${this.shortcuts.columns}
            ?color=${item.id === active}
            class='mmp-shortcuts__button'
            @click=${e => this.handleShortcut(e, item)}>
            <div align=${this.shortcuts.align_text}>
              ${item.icon ? html`<ha-icon .icon=${item.icon}></ha-icon>` : ''}
              ${item.image ? html`<img src=${item.image}>` : ''}
              ${item.name ? html`<span class="ellipsis">${item.name}</span>` : ''}
            </div>
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
    if (type === 'service')
      return this.player.toggleService(ev, id, data);
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

  shortcutStyle(item) {
    return {
      'min-height': `${this.height}px`,
      ...(item.cover && { 'background-image': `url(${item.cover})` }),
    };
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
        .mmp-shortcuts__button {
          min-width: calc(50% - 8px);
          flex: 1;
          background-size: cover;
          background-repeat: no-repeat;
          background-position: center center;
        }
        .mmp-shortcuts__button > div {
          display: flex;
          justify-content: center;
          align-items: center;
          width: 100%;
          padding: .2em 0;
        }
        .mmp-shortcuts__button > div[align='left'] {
          justify-content: flex-start;
        }
        .mmp-shortcuts__button > div[align='right'] {
          justify-content: flex-end;
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
        .mmp-shortcuts__button[columns='6'] {
          min-width: calc(16.66% - 8px);
        }
        .mmp-shortcuts__button > div > span {
          line-height: calc(var(--mmp-unit) * .6);
          text-transform: initial;
        }
        .mmp-shortcuts__button > div > ha-icon {
          width: calc(var(--mmp-unit) * .6);
          height: calc(var(--mmp-unit) * .6);
        }
        .mmp-shortcuts__button > div > *:nth-child(2) {
          margin-left: 4px;
        }
        .mmp-shortcuts__button > div > img {
          height: 24px;
        }
      `,
    ];
  }
}

customElements.define('mmp-shortcuts', MiniMediaPlayerShortcuts);
