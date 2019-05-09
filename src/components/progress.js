import { LitElement, html, css } from 'lit-element';

class MiniMediaPlayerProgress extends LitElement {
  static get properties() {
    return {
      _player: {},
      progress: Number,
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
          <paper-progress class='transiting'
            value=${this.progress}
            max=${this.player.mediaDuration}>
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
    const duration = this.player.mediaDuration;
    const pos = (e.offsetX / e.target.offsetWidth) * duration;
    this.player.seek(e, pos);
  }

  disconnectedCallback() {
    clearInterval(this.tracker);
  }

  static get styles() {
    return css`
      .mmp-progress {
        height: 12px;
        cursor: pointer;
        left: 0; right: 0; bottom: 0;
        position: absolute;
      }
      ha-card[group][collapse] .mmp-progress {
        bottom: -2px;
        height: 5px;
      }
      ha-card[group] paper-progress {
        height: var(--paper-progress-height, 2px);
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
