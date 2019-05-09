import { LitElement, html, css } from 'lit-element';

import convertProgress from '../utils/getProgress';

class MiniMediaPlayerProgress extends LitElement {
  static get properties() {
    return {
      _player: {},
      showTime: Boolean,
      progress: Number,
      duration: Number,
      tracker: {},
      track: Boolean,
    };
  }

  set player(player) {
    this._player = player;
    if (this.hasProgress) {
      this.trackProgress();
    }
  }

  get duration() {
    return this.player.mediaDuration;
  }

  get player() {
    return this._player;
  }

  get hasProgress() {
    return this.player.hasProgress;
  }

  render() {
    if (this.player.active && this.hasProgress) {
      return html`
        <div class='mmp-progress'
          @click=${this.handleSeek}
          ?paused=${!this.player.isPlaying}>
          ${this.showTime ? html`
            <div class='mmp-progress__duration'>
              <span>${(convertProgress(this.progress))}</span>
              <span>${(convertProgress(this.duration))}</span>
            </div>
          ` : ''}
          <paper-progress class='transiting'
            value=${this.progress}
            max=${this.duration}>
          </paper-progress>
        </div>
      `;
    } else {
      return html``;
    }
  }


  trackProgress() {
    this.progress = this.player.progress;
    if (!this.tracker)
      this.tracker = setInterval(() => this.trackProgress(), 1000);
    if (!this.player.isPlaying) {
      clearInterval(this.tracker);
      this.tracker = null;
    }
  }

  handleSeek(e) {
    const { duration } = this;
    const pos = (e.offsetX / e.target.offsetWidth) * duration;
    this.player.seek(e, pos);
  }

  disconnectedCallback() {
    clearInterval(this.tracker);
  }

  static get styles() {
    return css`
      .mmp-progress {
        cursor: pointer;
        left: 0; right: 0; bottom: 0;
        position: absolute;
      }
      .mmp-progress__duration {
        display: flex;
        justify-content: space-between;
        font-size: .8em;
        margin: 8px calc(var(--ha-card-border-radius, 4) / 2);
        padding: 0 6px;
      }
      paper-progress {
        height: var(--paper-progress-height, 4px);
        bottom: 0;
        position: absolute;
        width: 100%;
        --paper-progress-active-color: var(--mmp-accent-color);
        --paper-progress-container-color: rgba(100,100,100,.15);
        --paper-progress-transition-duration: 1s;
        --paper-progress-transition-timing-function: linear;
        --paper-progress-transition-delay: 0s;
      }
      .mmp-progress[paused] paper-progress {
        --paper-progress-active-color: var(--disabled-text-color, rgba(150,150,150,.5));
      }
    `;
  }
}

customElements.define('mmp-progress', MiniMediaPlayerProgress);
