import { LitElement, html, css } from 'lit-element';
import { classMap } from 'lit-html/directives/class-map';

import convertProgress from '../utils/getProgress';

class MiniMediaPlayerProgress extends LitElement {
  static get properties() {
    return {
      _player: {},
      showTime: Boolean,
      progress: Number,
      duration: Number,
      tracker: {},
      seekProgress: Number,
      seekWidth: Number,
      track: Boolean,
      ele: {},
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

  get width() {
    return this.shadowRoot.querySelector('.mmp-progress').offsetWidth;
  }

  get classes() {
    return classMap({
      transiting: !this.seekProgress,
      seeking: this.seekProgress,
    });
  }

  render() {
    return html`
      <div class='mmp-progress'
        @touchstart=${this.initSeek}
        @touchend=${this.handleSeek}
        @mousedown=${this.initSeek}
        @mouseup=${this.handleSeek}
        @mouseleave=${this.resetSeek}
        @click=${e => e.stopPropagation()}
        ?paused=${!this.player.isPlaying}>
        ${this.showTime ? html`
          <div class='mmp-progress__duration'>
            <span>${(convertProgress(this.seekProgress || this.progress))}</span>
            <span>${(convertProgress(this.duration))}</span>
          </div>
        ` : ''}
        <paper-progress class=${this.classes}
          value=${this.seekProgress || this.progress}
          max=${this.duration}>
        </paper-progress>
      </div>
    `;
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

  initSeek(e) {
    const x = e.clientX || e.touches[0].clientX;
    this.seekWidth = this.width;
    this.seekProgress = this.calcProgress(x);
    this.addEventListener('touchmove', this.moveSeek);
    this.addEventListener('mousemove', this.moveSeek);
  }

  resetSeek() {
    this.seekProgress = null;
    this.removeEventListener('touchmove', this.moveSeek);
    this.removeEventListener('mousemove', this.moveSeek);
  }

  moveSeek(e) {
    e.preventDefault();
    const x = e.clientX || e.touches[0].clientX;
    this.seekProgress = this.calcProgress(x);
  }

  handleSeek(e) {
    this.resetSeek();
    const x = e.clientX || e.changedTouches[0].clientX;
    const pos = this.calcProgress(x);
    this.player.seek(e, pos);
  }

  disconnectedCallback() {
    this.resetSeek();
    clearInterval(this.tracker);
  }

  calcProgress(x) {
    const pos = (x / this.seekWidth) * this.duration;
    return Math.min(Math.max(pos, 0.1), this.duration);
  }

  static get styles() {
    return css`
      .mmp-progress {
        cursor: pointer;
        left: 0; right: 0; bottom: 0;
        position: absolute;
        pointer-events: auto;
        min-height: 10px;
      }
      .mmp-progress__duration {
        display: flex;
        justify-content: space-between;
        font-size: .8em;
        margin: 8px calc(var(--ha-card-border-radius, 4px) / 2);
        margin-top: 0;
        padding: 0 6px;
      }
      paper-progress {
        height: var(--paper-progress-height, 4px);
        bottom: 0;
        position: absolute;
        width: 100%;
        transition: transform .15s ease-out;
        --paper-progress-active-color: var(--mmp-accent-color);
        --paper-progress-container-color: rgba(100,100,100,.15);
        --paper-progress-transition-duration: 1s;
        --paper-progress-transition-timing-function: linear;
        --paper-progress-transition-delay: 0s;
      }
      paper-progress.seeking {
        transform: scaleY(2);
      }
      .mmp-progress[paused] paper-progress {
        --paper-progress-active-color: var(--disabled-text-color, rgba(150,150,150,.5));
      }
    `;
  }
}

customElements.define('mmp-progress', MiniMediaPlayerProgress);
