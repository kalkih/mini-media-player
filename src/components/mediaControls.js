import { LitElement, html, css } from 'lit-element';
import { classMap } from 'lit-html/directives/class-map';

import { ICON } from '../consts.js';
import sharedStyle from '../styles/shared.js';

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

  get vol() {
    return Math.round(this.player.vol * 100);
  }

  render() {
    const { hide } = this.config;
    return html`
      ${!hide.volume ? this.renderVolControls(this.player.muted) : html``}
      ${this.showShuffle
        ? html`
            <div class="flex mmp-media-controls__shuffle">
              <ha-icon-button
                class="shuffle-button"
                @click=${e => this.player.toggleShuffle(e)}
                .icon=${ICON.SHUFFLE}
                ?color=${this.player.shuffle}
              >
              </ha-icon-button>
            </div>
          `
        : html``}
      ${!hide.controls
        ? html`
            <div
              class="flex mmp-media-controls__media"
              ?flow=${this.config.flow || this.break}
            >
              ${!hide.prev
                ? html` <ha-icon-button
                    @click=${e => this.player.prev(e)}
                    .icon=${ICON.PREV}
                  >
                  </ha-icon-button>`
                : ''}
              ${this.renderPlayButtons()}
              ${!hide.next
                ? html` <ha-icon-button
                    @click=${e => this.player.next(e)}
                    .icon=${ICON.NEXT}
                  >
                  </ha-icon-button>`
                : ''}
            </div>
          `
        : html``}
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
    return html` <div class=${classes}>
      ${volumeControls} ${showVolumeLevel ? this.renderVolLevel() : ''}
    </div>`;
  }

  renderVolSlider(muted) {
    return html`
      ${this.renderMuteButton(muted)}
      <ha-slider
        @change=${this.handleVolumeChange}
        @click=${e => e.stopPropagation()}
        ?disabled=${muted}
        min=${this.minVol}
        max=${this.maxVol}
        value=${this.player.vol * 100}
        step=${this.config.volume_step || 1}
        dir="ltr"
        ignore-bar-touch
        pin
      >
      </ha-slider>
    `;
  }

  renderVolButtons(muted) {
    return html`
      ${this.renderMuteButton(muted)}
      <ha-icon-button
        @click=${e => this.player.volumeDown(e)}
        .icon=${ICON.VOL_DOWN}
      >
      </ha-icon-button>
      <ha-icon-button
        @click=${e => this.player.volumeUp(e)}
        .icon=${ICON.VOL_UP}
      >
      </ha-icon-button>
    `;
  }

  renderVolLevel() {
    return html`
      <span class="mmp-media-controls__volume__level">${this.vol}%</span>
    `;
  }

  renderMuteButton(muted) {
    if (this.config.hide.mute) return html``;
    switch (this.config.replace_mute) {
      case 'play':
      case 'play_pause':
        return html`
          <ha-icon-button
            @click=${e => this.player.playPause(e)}
            .icon=${ICON.PLAY[this.player.isPlaying]}
          >
          </ha-icon-button>
        `;
      case 'stop':
        return html`
          <ha-icon-button
            @click=${e => this.player.stop(e)}
            .icon=${ICON.STOP.true}
          >
          </ha-icon-button>
        `;
      case 'play_stop':
        return html`
          <ha-icon-button
            @click=${e => this.player.playStop(e)}
            .icon=${ICON.STOP[this.player.isPlaying]}
          >
          </ha-icon-button>
        `;
      case 'next':
        return html`
          <ha-icon-button @click=${e => this.player.next(e)} .icon=${ICON.NEXT}>
          </ha-icon-button>
        `;
      default:
        if (!this.player.supportsMute) return html``;
        return html`
          <ha-icon-button
            @click=${e => this.player.toggleMute(e)}
            .icon=${ICON.MUTE[muted]}
          >
          </ha-icon-button>
        `;
    }
  }

  renderPlayButtons() {
    const { hide } = this.config;
    return html`
      ${!hide.play_pause
        ? html`
            <ha-icon-button
              @click=${e => this.player.playPause(e)}
              .icon=${ICON.PLAY[this.player.isPlaying]}
            >
            </ha-icon-button>
          `
        : html``}
      ${!hide.play_stop
        ? html`
            <ha-icon-button
              @click=${e => this.handleStop(e)}
              .icon=${hide.play_pause
                ? ICON.STOP[this.player.isPlaying]
                : ICON.STOP.true}
            >
            </ha-icon-button>
          `
        : html``}
    `;
  }

  handleStop(e) {
    return this.config.hide.play_pause
      ? this.player.playStop(e)
      : this.player.stop(e);
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
        ha-slider {
          max-width: none;
          min-width: 100px;
          width: 100%;
          --paper-slider-active-color: var(--mmp-accent-color);
          --paper-slider-knob-color: var(--mmp-accent-color);
        }
        ha-icon-button {
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
        .mmp-media-controls__shuffle {
          flex: 3;
          flex-shrink: 200;
          justify-content: center;
        }
        .mmp-media-controls__shuffle ha-icon-button {
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
