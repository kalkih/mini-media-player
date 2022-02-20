import { LitElement, html, css } from 'lit-element';
import { classMap } from 'lit-html/directives/class-map';

import { ICON, REPEAT_STATE } from '../const';
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

  get showRepeat() {
    return !this.config.hide.repeat && this.player.supportsRepeat;
  }

  get maxVol() {
    return this.config.max_volume || 100;
  }

  get minVol() {
    return this.config.min_volume || 0;
  }

  get vol() {
    return Math.round(this.player.vol * 100);
  }

  get jumpAmount() {
    return this.config.jump_amount || 10;
  }

  render() {
    const { hide } = this.config;
    return html`
      ${!hide.volume ? this.renderVolControls(this.player.muted) : html``}
      ${this.renderShuffleButton()}
      ${this.renderRepeatButton()}
      ${!hide.controls ? html`
        <div class='flex mmp-media-controls__media' ?flow=${this.config.flow || this.break}>
          ${!hide.prev && this.player.supportsPrev ? html`
            <mmp-icon-button
              @click=${e => this.player.prev(e)}
              .icon=${ICON.PREV}>
             <ha-icon .icon=${ICON.PREV}></ha-icon>
            </mmp-icon-button>` : ''}
          ${this.renderJumpBackwardButton()}
          ${this.renderPlayButtons()}
          ${this.renderJumpForwardButton()}
          ${!hide.next && this.player.supportsNext ? html`
            <mmp-icon-button
              @click=${e => this.player.next(e)}
              .icon=${ICON.NEXT}>
             <ha-icon .icon=${ICON.NEXT}></ha-icon>
            </mmp-icon-button>` : ''}
        </div>
      ` : html``}
    `;
  }

  renderShuffleButton() {
    return this.showShuffle ? html`
      <div class='flex mmp-media-controls__shuffle'>
        <mmp-icon-button
          class='shuffle-button'
          @click=${e => this.player.toggleShuffle(e)}
          .icon=${ICON.SHUFFLE}
          ?color=${this.player.shuffle}>
          <ha-icon .icon=${ICON.SHUFFLE}></ha-icon>
        </mmp-icon-button>
      </div>
    ` : html``;
  }

  renderRepeatButton() {
    if (!this.showRepeat) return html``;

    const colored = [REPEAT_STATE.ONE, REPEAT_STATE.ALL].includes(this.player.repeat);
    return html`
      <div class='flex mmp-media-controls__repeat'>
        <mmp-icon-button
          class='repeat-button'
          @click=${e => this.player.toggleRepeat(e)}
          .icon=${ICON.REPEAT[this.player.repeat]}
          ?color=${colored}>
          <ha-icon .icon=${ICON.REPEAT[this.player.repeat]}></ha-icon>
        </mmp-icon-button>
      </div>
    `;
  }

  renderVolControls(muted) {
    const volumeControls = this.config.volume_stateless
      ? this.renderVolButtons(muted)
      : this.renderVolSlider(muted);

    const classes = classMap({
      '--buttons': this.config.volume_stateless,
      'mmp-media-controls__volume': true,
      flex: true,
    });

    const showVolumeLevel = !this.config.hide.volume_level;
    return html`
      <div class=${classes}>
        ${volumeControls}
        ${showVolumeLevel ? this.renderVolLevel() : ''}
      </div>`;
  }

  renderVolSlider(muted) {
    return html`
      ${this.renderMuteButton(muted)}
      <paper-slider
        @change=${this.handleVolumeChange}
        @click=${e => e.stopPropagation()}
        ?disabled=${muted}
        min=${this.minVol} max=${this.maxVol}
        value=${this.player.vol * 100}
        step=${this.config.volume_step || 1}
        dir=${'ltr'}
        ignore-bar-touch pin>
      </paper-slider>
    `;
  }

  renderVolButtons(muted) {
    return html`
      ${this.renderMuteButton(muted)}
      <mmp-icon-button
        @click=${e => this.player.volumeDown(e)}
        .icon=${ICON.VOL_DOWN}>
          <ha-icon .icon=${ICON.VOL_DOWN}></ha-icon>
      </mmp-icon-button>
      <mmp-icon-button
        @click=${e => this.player.volumeUp(e)}
        .icon=${ICON.VOL_UP}>
          <ha-icon .icon=${ICON.VOL_UP}></ha-icon>
      </mmp-icon-button>
    `;
  }

  renderVolLevel() {
    return html`
      <span class="mmp-media-controls__volume__level">${this.vol}%</span>
    `;
  }

  renderMuteButton(muted) {
    if (this.config.hide.mute) return;
    switch (this.config.replace_mute) {
      case 'play':
      case 'play_pause':
        return html`
          <mmp-icon-button
            @click=${e => this.player.playPause(e)}
            .icon=${ICON.PLAY[this.player.isPlaying]}>
            <ha-icon .icon=${ICON.PLAY[this.player.isPlaying]}></ha-icon>
          </mmp-icon-button>
        `;
      case 'stop':
        return html`
          <mmp-icon-button
            @click=${e => this.player.stop(e)}
            .icon=${ICON.STOP.true}>
            <ha-icon .icon=${ICON.STOP.true}></ha-icon>
          </mmp-icon-button>
        `;
      case 'play_stop':
        return html`
          <mmp-icon-button
            @click=${e => this.player.playStop(e)}
            .icon=${ICON.STOP[this.player.isPlaying]}>
            <ha-icon .icon=${ICON.STOP[this.player.isPlaying]}></ha-icon>
          </mmp-icon-button>
        `;
      case 'next':
        return html`
          <mmp-icon-button
            @click=${e => this.player.next(e)}
            .icon=${ICON.NEXT}>
            <ha-icon .icon=${ICON.NEXT}></ha-icon>
          </mmp-icon-button>
        `;
      default:
        if (!this.player.supportsMute) return;
        return html`
          <mmp-icon-button
            @click=${e => this.player.toggleMute(e)}
            .icon=${ICON.MUTE[muted]}>
            <ha-icon .icon=${ICON.MUTE[muted]}></ha-icon>
          </mmp-icon-button>
        `;
    }
  }

  renderPlayButtons() {
    const { hide } = this.config;
    return html`
      ${!hide.play_pause ? html`
        <mmp-icon-button
          @click=${e => this.player.playPause(e)}
          .icon=${ICON.PLAY[this.player.isPlaying]}>
            <ha-icon .icon=${ICON.PLAY[this.player.isPlaying]}></ha-icon>
        </mmp-icon-button>
      ` : html``}
      ${!hide.play_stop ? html`
        <mmp-icon-button
          @click=${e => this.handleStop(e)}
          .icon=${hide.play_pause ? ICON.STOP[this.player.isPlaying] : ICON.STOP.true}>
            <ha-icon .icon=${hide.play_pause ? ICON.STOP[this.player.isPlaying] : ICON.STOP.true}></ha-icon>
        </mmp-icon-button>
      ` : html``}
    `;
  }

  renderJumpForwardButton() {
    const hidden = this.config.hide.jump;
    if (hidden || !this.player.hasProgress) return html``;
    return html`
      <mmp-icon-button
        @click=${e => this.player.jump(e, this.jumpAmount)}
        .icon=${ICON.FAST_FORWARD}>
        <ha-icon .icon=${ICON.FAST_FORWARD}></ha-icon>
      </mmp-icon-button>
    `;
  }

  renderJumpBackwardButton() {
    const hidden = this.config.hide.jump;
    if (hidden || !this.player.hasProgress) return html``;
    return html`
      <mmp-icon-button
        @click=${e => this.player.jump(e, -this.jumpAmount)}
        .icon=${ICON.REWIND}>
        <ha-icon .icon=${ICON.REWIND}></ha-icon>
      </mmp-icon-button>
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
          justify-content: space-between;
        }
        .flex {
          display: flex;
          flex: 1;
          justify-content: space-between;
        }
        paper-slider {
          max-width: none;
          min-width: 100px;
          width: 100%;
          --paper-slider-active-color: var(--mmp-accent-color);
          --paper-slider-knob-color: var(--mmp-accent-color);
        }
        mmp-icon-button {
          min-width: var(--mmp-unit);
        }
        .mmp-media-controls__volume {
          flex: 100;
          max-height: var(--mmp-unit);
          align-items: center;
        }
        .mmp-media-controls__volume.--buttons {
          justify-content: left;
        }
        .mmp-media-controls__media {
          margin-right: 0;
          margin-left: auto;
          justify-content: inherit;
        }
        .mmp-media-controls__media[flow] {
          max-width: none;
          justify-content: space-between;
        }
        .mmp-media-controls__shuffle,
        .mmp-media-controls__repeat {
          flex: 3;
          flex-shrink: 200;
          justify-content: center;
        }
      `,
    ];
  }
}

customElements.define('mmp-media-controls', MiniMediaPlayerMediaControls);
