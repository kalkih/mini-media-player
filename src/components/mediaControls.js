import { LitElement, html, css } from 'lit-element';

import { ICON } from '../const';
import sharedStyle from '../sharedStyle';

class MiniMediaPlayerMediaControls extends LitElement {
  static get properties() {
    return {
      player: {},
      config: {},
      break: Boolean,
    };
  }

  get showShuffle() {
    return !this.config.hide.shuffle && this.player.supportsShuffle;
  }

  get maxVol() {
    return this.config.max_volume || 100;
  }

  get minVol() {
    return this.config.min_volume || 0;
  }

  render() {
    const { hide } = this.config;
    return html`
      ${!hide.volume ? this.renderVolControls(this.player.muted) : html``}
      ${this.showShuffle ? html`
        <div class='flex mmp-media-controls__shuffle'>
          <paper-icon-button
            class='shuffle-button'
            @click=${e => this.player.toggleShuffle(e)}
            .icon=${ICON.SHUFFLE}
            ?color=${this.player.shuffle}>
          </paper-icon-button>
        </div>
      ` : html``}
      ${!hide.controls ? html`
        <div class='flex mmp-media-controls__media' ?flow=${this.config.flow || this.break}>
          <paper-icon-button
            @click=${e => this.player.prev(e)}
            .icon=${ICON.PREV}>
          </paper-icon-button>
          ${this.renderPlayButtons()}
          <paper-icon-button
            @click=${e => this.player.next(e)}
            .icon=${ICON.NEXT}>
          </paper-icon-button>
        </div>
      ` : html``}
    `;
  }

  renderVolControls(muted) {
    if (this.config.volume_stateless)
      return this.renderVolButtons(muted);
    else
      return this.renderVolSlider(muted);
  }

  renderVolSlider(muted) {
    return html`
      <div class='mmp-media-controls__volume --slider flex'>
        ${this.renderMuteButton(muted)}
        <ha-slider
          @change=${this.handleVolumeChange}
          @click=${e => e.stopPropagation()}
          ?disabled=${muted}
          min=${this.minVol} max=${this.maxVol}
          value=${this.player.vol * 100}
          dir=${'ltr'}
          ignore-bar-touch pin>
        </ha-slider>
      </div>`;
  }

  renderVolButtons(muted) {
    return html`
      <div class='mmp-media-controls__volume --buttons flex'>
        ${this.renderMuteButton(muted)}
        <paper-icon-button
          @click=${e => this.player.volumeDown(e)}
          .icon=${ICON.VOL_DOWN}>
        </paper-icon-button>
        <paper-icon-button
          @click=${e => this.player.volumeUp(e)}
          .icon=${ICON.VOL_UP}>
        </paper-icon-button>
      </div>`;
  }

  renderMuteButton(muted) {
    if (this.config.hide.mute) return;
    switch (this.config.replace_mute) {
      case 'play':
      case 'play_pause':
        return html`
          <paper-icon-button
            @click=${e => this.player.playPause(e)}
            .icon=${ICON.PLAY[this.player.isPlaying]}>
          </paper-icon-button>
        `;
      case 'stop':
        return html`
          <paper-icon-button
            @click=${e => this.player.stop(e)}
            .icon=${ICON.STOP.true}>
          </paper-icon-button>
        `;
      case 'play_stop':
        return html`
          <paper-icon-button
            @click=${e => this.player.playStop(e)}
            .icon=${ICON.STOP[this.player.isPlaying]}>
          </paper-icon-button>
        `;
      case 'next':
        return html`
          <paper-icon-button
            @click=${e => this.player.next(e)}
            .icon=${ICON.NEXT}>
          </paper-icon-button>
        `;
      default:
        if (!this.player.supportsMute) return;
        return html`
          <paper-icon-button
            @click=${e => this.player.toggleMute(e)}
            .icon=${ICON.MUTE[muted]}>
          </paper-icon-button>
        `;
    }
  }

  renderPlayButtons() {
    const { hide } = this.config;
    return html`
      ${!hide.play_pause ? html`
        <paper-icon-button
          @click=${e => this.player.playPause(e)}
          .icon=${ICON.PLAY[this.player.isPlaying]}>
        </paper-icon-button>
      ` : html``}
      ${!hide.play_stop ? html`
        <paper-icon-button
          @click=${e => this.handleStop(e)}
          .icon=${hide.play_pause ? ICON.STOP[this.player.isPlaying] : ICON.STOP.true}>
        </paper-icon-button>
      ` : html``}
    `;
  }

  handleStop(e) {
    return this.config.hide.play_pause ? this.player.playStop(e) : this.player.stop(e);
  }

  handleVolumeChange(ev) {
    const vol = parseFloat(ev.target.value) / 100;
    this.player.setVolume(ev, vol);
  }

  static get styles() {
    return [
      sharedStyle,
      css`
        :host {
          display: flex;
          width: 100%;
        }
        .flex {
          display: flex;
          flex: 1;
          justify-content: space-between;
        }
        ha-slider {
          max-width: none;
          min-width: 100px;
          width: 100%;
        }
        paper-icon-button {
          min-width: 40px;
        }
        .mmp-media-controls__volume {
          flex: 100;
          max-height: 40px;
        }
        .mmp-media-controls__volume.--buttons {
          justify-content: left;
        }
        .mmp-media-controls__media {
          justify-content: flex-end;
          max-width: calc(40px * 4);
          margin-right: 0;
          margin-left: auto;
        }
        .mmp-media-controls__media[flow] {
          max-width: none;
        }
        .mmp-media-controls__shuffle {
          flex: 3;
          flex-shrink: 200;
          justify-content: center;
        }
        .mmp-media-controls__shuffle paper-icon-button {
          height: 36px;
          width: 36px;
          min-width: 36px;
          margin: 2px;
        }
      `,
    ];
  }
}

customElements.define('mmp-media-controls', MiniMediaPlayerMediaControls);
