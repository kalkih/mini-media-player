import { LitElement, html, css } from 'lit-element';
import { classMap } from 'lit-html/directives/class-map';

import convertProgress from '../utils/getProgress';
import {styleMap} from 'lit-html/directives/style-map';

class MiniMediaPlayerProgress extends LitElement {
  static get properties() {
    return {
      _player: {},
      showTime: Boolean,
      showRemainingTime: Boolean,
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
            <span>${convertProgress(this.seekProgress || this.progress)}</span>
            <div>
              ${this.showTime ? html`
                <span class='mmp-progress__duration__remaining'>
                  -${(convertProgress(this.duration - (this.seekProgress || this.progress)))} |
                </span>
              ` : ''}
              <span>${convertProgress(this.duration)}</span>
            </div>
          </div>
        ` : ''}
        <div class='progress-bar' style=${this.progressBarStyle()}></div>
      </div>
    `;
  }
   progressBarStyle() {
    return styleMap({
      width: `${((this.seekProgress || this.progress) / this.duration) * 100}%`
    });
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
      .mmp-progress:before {
        content: '';
        position: absolute;
        left: 0;
        right: 0;
        bottom: 0;
        height: var(--mmp-progress-height);
        background-color: rgba(100,100,100,.15);
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
      .mmp-progress__duration__remaining {
        opacity: .5;
      }
      .progress-bar {
        height: var(--mmp-progress-height);
        bottom: 0;
        position: absolute;
        width: 0;
        transition: height 0;
        z-index: 1;
        background-color: var(--mmp-accent-color);
      }
      .progress-bar.seeking {
        transition: height .15s ease-out;
        height: calc(var(--mmp-progress-height) + 4px);
      }
      .mmp-progress[paused] .progress-bar {
        background-color: var(--disabled-text-color, rgba(150,150,150,.5));
      }
    `;
  }
}

customElements.define('mmp-progress', MiniMediaPlayerProgress);
