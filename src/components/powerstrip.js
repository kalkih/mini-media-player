import { LitElement, html, css } from 'lit';

import './sourceMenu';
import './soundMenu';
import './mediaControls';

import { ICON } from '../const';
import sharedStyle from '../sharedStyle';

import t from '../utils/translation';

class MiniMediaPlayerPowerstrip extends LitElement {
  static get properties() {
    return {
      hass: {},
      player: {},
      config: {},
      groupVisible: Boolean,
      idle: Boolean,
    };
  }

  get icon() {
    return this.config.speaker_group.icon || ICON.GROUP;
  }

  get showGroupButton() {
    return this.config.speaker_group.entities.length > 0 && !this.config.hide.group_button;
  }

  get showBrowseButton() {
    return !this.config.hide.media_browse && this.player.supportsBrowseMedia;
  }

  get showPowerButton() {
    return !this.config.hide.power;
  }

  get powerColor() {
    return this.player.isActive && !this.config.hide.power_state;
  }

  get sourceSize() {
    return this.config.source === 'icon' || this.hasControls || this.idle;
  }

  get soundSize() {
    return this.config.sound_mode === 'icon' || this.hasControls || this.idle;
  }

  get hasControls() {
    return this.player.isActive && this.config.hide.controls !== this.config.hide.volume;
  }

  get hasSource() {
    return this.player.sources.length > 0 && !this.config.hide.source;
  }

  get hasSoundMode() {
    return this.player.soundModes.length > 0 && !this.config.hide.sound_mode;
  }

  get showLabel() {
    return !this.config.hide.state_label;
  }

  render() {
    if (this.player.isUnavailable && this.showLabel)
      return html`
        <span class="label ellipsis"> ${t(this.hass, 'state.unavailable', 'state.default.unavailable')} </span>
      `;

    return html`
      ${this.idle ? this.renderIdleView : ''}
      ${this.hasControls
        ? html` <mmp-media-controls .player=${this.player} .config=${this.config}> </mmp-media-controls> `
        : ''}
      ${this.hasSource
        ? html` <mmp-source-menu .player=${this.player} .icon=${this.sourceSize} ?full=${this.config.source === 'full'}>
          </mmp-source-menu>`
        : ''}
      ${this.hasSoundMode
        ? html` <mmp-sound-menu
            .player=${this.player}
            .icon=${this.soundSize}
            ?full=${this.config.sound_mode === 'full'}
          >
          </mmp-sound-menu>`
        : ''}
      ${this.showBrowseButton
        ? html` <ha-icon-button
            class="browse-button"
            .icon=${ICON.BROWSE}
            @click=${(e) => this.handleBrowseClick(e)}
          >
            <ha-icon .icon=${ICON.BROWSE}></ha-icon>
          </ha-icon-button>`
        : ''}
      ${this.showGroupButton
        ? html` <ha-icon-button
            class="group-button"
            .icon=${this.icon}
            ?inactive=${!this.player.isGrouped}
            ?color=${this.groupVisible}
            @click=${this.handleGroupClick}
          >
            <ha-icon .icon=${this.icon}></ha-icon>
          </ha-icon-button>`
        : ''}
      ${this.showPowerButton
        ? html` <ha-icon-button
            class="power-button"
            .icon=${ICON.POWER}
            @click=${(e) => this.player.toggle(e)}
            ?color=${this.powerColor}
          >
            <ha-icon .icon=${ICON.POWER}></ha-icon>
          </ha-icon-button>`
        : ''}
    `;
  }

  handleGroupClick(ev) {
    ev.stopPropagation();
    this.dispatchEvent(new CustomEvent('toggleGroupList'));
  }

  // Opens the HA media browser dialog (same as the built-in media control card).
  // HA lazy-loads dialog-media-player-browse via a webpack dynamic import that
  // custom cards cannot replicate directly. To obtain the real chunk loader, we
  // instantiate HA's built-in hui-media-control-card, call its _handleBrowseMedia(),
  // and intercept the show-dialog event to capture the dialogImport function.
  // On subsequent clicks the dialog element is already registered, so we skip
  // the loader extraction and fire show-dialog immediately.
  async handleBrowseClick(ev) {
    ev.stopPropagation();
    const entityId = this.player._entityId;

    // Fast path: dialog already loaded
    if (customElements.get('dialog-media-player-browse')) {
      this._openBrowseDialog(ev, entityId, () => Promise.resolve());
      return;
    }

    // Load the built-in media control card to get access to the webpack
    // chunk loader for dialog-media-player-browse
    try {
      if (!customElements.get('hui-media-control-card')) {
        const helpers = await window.loadCardHelpers();
        await helpers.createCardElement({ type: 'media-control', entity: entityId });
        await customElements.whenDefined('hui-media-control-card');
      }

      const tempCard = document.createElement('hui-media-control-card');
      tempCard.setConfig({ type: 'media-control', entity: entityId });
      tempCard.hass = this.hass;

      let dialogImport = () => Promise.resolve();
      tempCard.addEventListener('show-dialog', (e) => {
        e.stopPropagation();
        dialogImport = e.detail.dialogImport;
      });
      tempCard._handleBrowseMedia();

      this._openBrowseDialog(ev, entityId, dialogImport);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('mini-media-player: failed to open browse dialog:', err);
    }
  }

  _openBrowseDialog(ev, entityId, dialogImport) {
    this.dispatchEvent(new CustomEvent('show-dialog', {
      bubbles: true,
      composed: true,
      detail: {
        dialogTag: 'dialog-media-player-browse',
        dialogImport,
        dialogParams: {
          action: 'play',
          entityId,
          mediaPickedCallback: (pickedMedia) => {
            this.player.setMedia(ev, {
              media_content_id: pickedMedia.item.media_content_id,
              media_content_type: pickedMedia.item.media_content_type,
            });
          },
        },
      },
    }));
  }

  get renderIdleView() {
    if (this.player.isPaused)
      return html` <ha-icon-button .icon=${ICON.PLAY[this.player.isPlaying]} @click=${(e) => this.player.playPause(e)}>
        <ha-icon .icon=${ICON.PLAY[this.player.isPlaying]}></ha-icon>
      </ha-icon-button>`;
    else if (this.showLabel)
      return html` <span class="label ellipsis"> ${t(this.hass, 'state.idle', 'state.media_player.idle')} </span> `;
    else return html``;
  }

  static get styles() {
    return [
      sharedStyle,
      css`
        :host {
          display: flex;
          line-height: var(--mmp-unit);
          max-height: var(--mmp-unit);
        }
        :host([flow]) mmp-media-controls {
          max-width: unset;
        }
        mmp-media-controls {
          max-width: calc(var(--mmp-unit) * 5);
          line-height: initial;
          justify-content: flex-end;
        }
        mmp-source-menu,
        mmp-sound-menu {
          min-width: 0;
          max-width: 120px;
          flex: 0 1 auto;
        }
        mmp-source-menu[full],
        mmp-sound-menu[full] {
          max-width: 100%;
        }
        .group-button {
          --mdc-icon-size: calc(var(--mmp-unit) * 0.5);
        }
        ha-icon-button {
          min-width: var(--mmp-unit);
        }
      `,
    ];
  }
}

customElements.define('mmp-powerstrip', MiniMediaPlayerPowerstrip);
