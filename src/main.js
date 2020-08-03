import { LitElement, html } from 'lit-element';
import { classMap } from 'lit-html/directives/class-map';
import { styleMap } from 'lit-html/directives/style-map';
import ResizeObserver from 'resize-observer-polyfill';

import { generateConfig } from './utils/config';
import MediaPlayerObject from './model';
import style from './style';
import sharedStyle from './sharedStyle';
import handleClick from './utils/handleClick';
import colorsFromPicture from './utils/colorGenerator';

import './ensureComponents';

import './components/groupList';
import './components/dropdown';
import './components/shortcuts';
import './components/tts';
import './components/progress';
import './components/powerstrip';
import './components/mediaControls';

import {
  ICON,
  UPDATE_PROPS,
  BREAKPOINT,
} from './const';

class MiniMediaPlayer extends LitElement {
  constructor() {
    super();
    this._overflow = false;
    this.initial = true;
    this.picture = false;
    this.thumbnail = '';
    this.prevThumbnail = '';
    this.edit = false;
    this.rtl = false;
    this.cardHeight = 0;
    this.foregroundColor = '';
    this.backgroundColor = '';
  }

  static get properties() {
    return {
      _hass: {},
      config: {},
      entity: {},
      player: {},
      _overflow: Boolean,
      break: Boolean,
      initial: Boolean,
      picture: String,
      thumbnail: String,
      prevThumbnail: String,
      edit: Boolean,
      rtl: Boolean,
      idle: Boolean,
      cardHeight: Number,
      foregroundColor: String,
      backgroundColor: String,
    };
  }

  static get styles() {
    return [
      sharedStyle,
      style,
    ];
  }

  set hass(hass) {
    if (!hass) return;
    const entity = hass.states[this.config.entity];
    this._hass = hass;
    if (entity && this.entity !== entity) {
      this.entity = entity;
      this.player = new MediaPlayerObject(hass, this.config, entity);
      this.rtl = this.computeRTL(hass);
      this.idle = this.player.idle;
      if (this.player.trackIdle) this.updateIdleStatus();
    }
  }

  get hass() {
    return this._hass;
  }

  set overflow(v) {
    if (this._overflow !== v) this._overflow = v;
  }

  get overflow() {
    return this._overflow;
  }

  get name() {
    return this.config.name || this.player.name;
  }

  setConfig(config) {
    this.config = generateConfig(config);
  }

  shouldUpdate(changedProps) {
    if (this.break === undefined) this.computeRect(this);
    if (changedProps.has('prevThumbnail') && this.prevThumbnail) {
      setTimeout(() => {
        this.prevThumbnail = '';
      }, 1000);
    }
    if (changedProps.has('player') && this.config.artwork === 'material') {
      this.setColors();
    }
    return UPDATE_PROPS.some(prop => changedProps.has(prop)) && this.player;
  }

  firstUpdated() {
    const ro = new ResizeObserver((entries) => {
      entries.forEach((entry) => {
        window.requestAnimationFrame(() => {
          if (this.config.info === 'scroll') this.computeOverflow();
          if (!this._resizeTimer) {
            this.computeRect(entry);
            this._resizeTimer = setTimeout(() => {
              this._resizeTimer = null;
              this.computeRect(this._resizeEntry);
              this.measureCard();
            }, 250);
          }
          this._resizeEntry = entry;
        });
      });
    });
    ro.observe(this);

    setTimeout(() => this.initial = false, 250);
    this.edit = this.config.speaker_group.expanded || false;
  }

  updated() {
    if (this.config.info === 'scroll')
      setTimeout(() => {
        this.computeOverflow();
      }, 10);
  }

  render({ config } = this) {
    const artwork = this.computeArtwork();

    return html`
      <ha-card
        class=${this.computeClasses()}
        style=${this.computeStyles()}
        @click=${e => this.handlePopup(e)}
        artwork=${config.artwork}
        content=${this.player.content}>
        <div class='mmp__bg'>
          ${this.renderArtwork(artwork)}
          ${this.renderGradient()}
        </div>
        <div class='mmp-player'>
          <div class='mmp-player__core flex' ?inactive=${this.player.idle}>
            ${this.renderIcon(artwork)}
            <div class='entity__info'>
              ${this.renderEntityName()}
              ${this.renderMediaInfo()}
            </div>
            <mmp-powerstrip
              @toggleGroupList=${this.toggleGroupList}
              .hass=${this.hass}
              .player=${this.player}
              .config=${config}
              .groupVisible=${this.edit}
              .idle=${this.idle}
              ?flow=${config.flow}>
            </mmp-powerstrip>
          </div>
          <div class='mmp-player__adds'>
            ${!config.collapse && this.player.active ? html`
              <mmp-media-controls
                .player=${this.player}
                .config=${config}
                .break=${this.break}>
              </mmp-media-controls>
            ` : ''}
            <mmp-shortcuts
              .player=${this.player}
              .shortcuts=${config.shortcuts}>
            </mmp-shortcuts>
            ${config.tts ? html`
              <mmp-tts
                .config=${config.tts}
                .hass=${this.hass}
                .player=${this.player}>
              </mmp-tts>
            ` : ''}
            <mmp-group-list
              .hass=${this.hass}
              .visible=${this.edit}
              .entities=${config.speaker_group.entities}
              .player=${this.player}>
            </mmp-group-list>
          </div>
        </div>
        <div class='mmp__container'>
          ${this.player.active && this.player.hasProgress ? html`
            <mmp-progress
              .player=${this.player}
              .showTime=${!this.config.hide.runtime}>
            </mmp-progress>
          ` : ''}
        </div>
      </ha-card>
    `;
  }

  computeClasses({ config } = this) {
    return classMap({
      '--responsive': this.break || config.hide.icon,
      '--initial': this.initial,
      '--bg': config.background,
      '--group': config.group,
      '--more-info': config.tap_action !== 'none',
      '--has-artwork': this.player.hasArtwork && this.thumbnail,
      '--flow': config.flow,
      '--collapse': config.collapse,
      '--rtl': this.rtl,
      '--progress': this.player.hasProgress,
      '--runtime': !config.hide.runtime && this.player.hasProgress,
      '--inactive': !this.player.isActive,
    });
  }

  renderArtwork(artwork) {
    if (!this.thumbnail && !this.config.background)
      return;

    const url = this.config.background
      && (!artwork || this.config.artwork === 'default')
      ? `url(${this.config.background})`
      : this.thumbnail;

    const artworkStyle = {
      backgroundImage: url,
      backgroundColor: this.backgroundColor || '',
      width: this.config.artwork === 'material' ? `${this.cardHeight}px` : '',
    };
    const artworkPrevStyle = {
      backgroundImage: this.prevThumbnail,
      width: this.config.artwork === 'material' ? `${this.cardHeight}px` : '',
    };

    return html`
      <div class='cover' style=${styleMap(artworkStyle)}></div>
      ${this.prevThumbnail && html`
        <div class='cover --prev' style=${styleMap(artworkPrevStyle)}></div>
      `}`;
  }

  renderGradient() {
    if (this.config.artwork !== 'material')
      return;

    const gradientStyle = {
      backgroundImage: `linear-gradient(to left,
        transparent 0,
        ${this.backgroundColor} ${this.cardHeight}px,
        ${this.backgroundColor} 100%)`,
    };

    return html`<div class="cover-gradient" style=${styleMap(gradientStyle)}></div>`;
  }

  handlePopup(e) {
    e.stopPropagation();
    handleClick(this, this._hass, this.config, this.config.tap_action, this.player.id);
  }

  renderIcon(artwork) {
    if (this.config.hide.icon) return;
    if (this.player.active && artwork && this.config.artwork === 'default')
      return html`
        <div class='entity__artwork'
          style='background-image: ${this.thumbnail};'
          ?border=${!this.config.hide.artwork_border}
          state=${this.player.state}>
        </div>`;

    const state = !this.config.hide.icon_state && this.player.isActive;
    return html`
      <div class='entity__icon' ?color=${state}>
        <ha-icon .icon=${this.computeIcon()}></ha-icon>
      </div>`;
  }

  renderEntityName() {
    if (this.config.hide.name) return;

    return html`
      <div class='entity__info__name'>
        ${this.name} ${this.speakerCount()}
      </div>`;
  }

  renderMediaInfo() {
    if (this.config.hide.info) return;
    const items = this.player.mediaInfo;

    return html`
      <div class='entity__info__media'
        ?short=${this.config.info === 'short' || !this.player.active}
        ?short-scroll=${this.config.info === 'scroll'}
        ?scroll=${this.overflow}
        style='animation-duration: ${this.overflow}s;'>
        ${this.config.info === 'scroll' ? html`
          <div>
            <div class='marquee'>
              ${items.map(i => html`<span class=${`attr__${i.attr}`}>${i.prefix + i.text}</span>`)}
            </div>
          </div>` : ''}
        ${items.map(i => html`<span class=${`attr__${i.attr}`}>${i.prefix + i.text}</span>`)}
      </div>`;
  }

  speakerCount() {
    if (this.config.speaker_group.show_group_count) {
      const count = this.player.groupCount;
      return count > 1 ? ` +${count - 1}` : '';
    }
  }

  computeStyles() {
    const { scale } = this.config;
    return styleMap({
      ...(
        scale && { '--mmp-unit': `${40 * scale}px` },
        (this.foregroundColor && this.player.isActive) && {
          '--mmp-text-color': this.foregroundColor,
          '--mmp-icon-color': this.foregroundColor,
          '--mmp-icon-active-color': this.foregroundColor,
          '--mmp-accent-color': this.foregroundColor,
          '--paper-slider-container-color': this.foregroundColor,
          '--secondary-text-color': this.foregroundColor,
          '--mmp-media-cover-info-color': this.foregroundColor,
        }
      ),
    });
  }

  async computeArtwork() {
    const { picture, hasArtwork } = this.player;
    if (hasArtwork && picture !== this.picture) {
      this.picture = picture;
      try {
        const artwork = await this.player.fetchArtwork();
        if (this.thumbnail) {
          this.prevThumbnail = this.thumbnail;
        }
        this.thumbnail = artwork;
      } catch (error) {
        this.thumbnail = '';
      }
    }
    return !!(hasArtwork && this.thumbnail);
  }

  computeIcon() {
    return this.config.icon
      ? this.config.icon : this.player.icon
      || ICON.DEFAULT;
  }

  measureCard() {
    const card = this.shadowRoot.querySelector('ha-card');
    if (!card) {
      return;
    }

    this.cardHeight = card.offsetHeight;
  }

  computeOverflow() {
    const ele = this.shadowRoot.querySelector('.marquee');
    if (ele) {
      const status = ele.clientWidth > ele.parentNode.clientWidth;
      this.overflow = status && this.player.active ? 7.5 + (ele.clientWidth / 50) : false;
    }
  }

  computeRect(entry) {
    const { left, width } = entry.contentRect || entry.getBoundingClientRect();
    this.break = (width + left * 2) < BREAKPOINT;
  }

  computeRTL(hass) {
    const lang = hass.language || 'en';
    if (hass.translationMetadata.translations[lang]) {
      return hass.translationMetadata.translations[lang].isRTL || false;
    }
    return false;
  }

  toggleGroupList() {
    this.edit = !this.edit;
  }

  updateIdleStatus() {
    if (this._idleTracker) clearTimeout(this._idleTracker);
    const diff = (Date.now() - new Date(this.player.updatedAt).getTime()) / 1000;
    this._idleTracker = setTimeout(() => {
      this.idle = this.player.checkIdleAfter(this.config.idle_view.after);
      this.player.idle = this.idle;
      this._idleTracker = null;
    }, ((this.config.idle_view.after * 60) - diff) * 1000);
  }

  getCardSize() {
    return this.config.collapse ? 1 : 2;
  }

  async setColors() {
    if (this.player.picture === this.picture)
      return;

    if (!this.player.picture) {
      this.foregroundColor = '';
      this.backgroundColor = '';
      return;
    }

    try {
      [this.foregroundColor, this.backgroundColor] = await colorsFromPicture(this.player.picture);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Error getting Image Colors', err);
      this.foregroundColor = '';
      this.backgroundColor = '';
    }
  }
}

customElements.define('mini-media-player', MiniMediaPlayer);
