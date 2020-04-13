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

  get offset() {
    return this.getBoundingClientRect().left;
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
    const x = e.offsetX || (e.touches[0].pageX - this.offset);
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
    const x = e.offsetX || (e.touches[0].pageX - this.offset);
    this.seekProgress = this.calcProgress(x);
  }

  handleSeek(e) {
    this.resetSeek();
    const x = e.offsetX || (e.changedTouches[0].pageX - this.offset);
    const pos = this.calcProgress(x);
    this.player.seek(e, pos);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.resetSeek();
    clearInterval(this.tracker);
    this.tracker = null;
  }

  connectedCallback() {
    super.connectedCallback();
    if (this.hasProgress) {
      this.trackProgress();
    }
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
        min-height: calc(var(--mmp-progress-height) + 10px);
      }
      .mmp-progress__duration {
        left: calc(var(--ha-card-border-radius, 4px) / 2);
        right: calc(var(--ha-card-border-radius, 4px) / 2);
        bottom: calc(var(--mmp-progress-height) + 6px);
        position: absolute;
        display: flex;
        justify-content: space-between;
        font-size: .8em;
        padding: 0 6px;
        z-index: 2
      }
      paper-progress {
        height: var(--mmp-progress-height);
        --paper-progress-height: var(--mmp-progress-height);
        bottom: 0;
        position: absolute;
        width: 100%;
        transition: height 0;
        z-index: 1;
        --paper-progress-active-color: var(--mmp-accent-color);
        --paper-progress-container-color: rgba(100,100,100,.15);
        --paper-progress-transition-duration: 1s;
        --paper-progress-transition-timing-function: linear;
        --paper-progress-transition-delay: 0s;
      }
      paper-progress.seeking {
        transition: height .15s ease-out;
        height: calc(var(--mmp-progress-height) + 4px);
        --paper-progress-height: calc(var(--mmp-progress-height) + 4px);
      }
      .mmp-progress[paused] paper-progress {
        --paper-progress-active-color: var(--disabled-text-color, rgba(150,150,150,.5));
      }
    `;
  }
}

customElements.define('mmp-progress', MiniMediaPlayerProgress);
