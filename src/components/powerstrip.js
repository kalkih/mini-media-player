import { LitElement, html, css } from 'lit-element';

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
    return this.config.speaker_group.entities;
  }

  get showPowerButton() {
    return !this.config.hide.power;
  }

  get powerColor() {
    return this.player.active && !this.config.hide.power_state;
  }

  get sourceSize() {
    return (this.config.source === 'icon' || this.hasControls || this.idle);
  }

  get soundSize() {
    return (this.config.sound_mode === 'icon' || this.hasControls || this.idle);
  }

  get hasControls() {
    return this.player.active && (this.config.hide.controls !== this.config.hide.volume);
  }

  get hasSource() {
    return (this.player.sources.length > 0 && !this.config.hide.source);
  }

  get hasSoundMode() {
    return (this.player.soundModes.length > 0 && !this.config.hide.sound_mode);
  }

  render() {
    if (this.player.isUnavailable)
      return html`
        <span class='label ellipsis'>
          ${t(this.hass, 'state.unavailable', 'state.default.unavailable')}
        </span>
      `;

    return html`
      ${this.idle ? this.renderIdleView : ''}
      ${this.hasControls ? html`
        <mmp-media-controls
          .player=${this.player}
          .config=${this.config}>
        </mmp-media-controls>
      ` : ''}
      ${this.hasSource ? html`
        <mmp-source-menu
          .player=${this.player}
          .icon=${this.sourceSize}
          ?full=${this.config.source === 'full'}>
        </mmp-source-menu>` : ''}
      ${this.hasSoundMode ? html`
        <mmp-sound-menu
          .player=${this.player}
          .icon=${this.soundSize}
          ?full=${this.config.sound_mode === 'full'}>
        </mmp-sound-menu>` : ''}
      ${this.showGroupButton ? html`
        <ha-icon-button class='group-button'
          .icon=${this.icon}
          ?inactive=${!this.player.isGrouped}
          ?color=${this.groupVisible}
          @click=${this.handleGroupClick}>
        </ha-icon-button>` : ''}
      ${this.showPowerButton ? html`
        <ha-icon-button class='power-button'
          .icon=${ICON.POWER}
          @click=${e => this.player.toggle(e)}
          ?color=${this.powerColor}>
        </ha-icon-button>` : ''}
    `;
  }

  handleGroupClick(ev) {
    ev.stopPropagation();
    this.dispatchEvent(new CustomEvent('toggleGroupList'));
  }

  get renderIdleView() {
    if (this.player.isPaused)
      return html`
        <ha-icon-button
          .icon=${ICON.PLAY[this.player.isPlaying]}
          @click=${e => this.player.playPause(e)}>
        </ha-icon-button>`;
    else
      return html`
        <span class='label ellipsis'>
          ${t(this.hass, 'state.idle', 'state.media_player.idle')}
        </span>
      `;
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
