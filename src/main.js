import { LitElement, html } from 'lit-element';
import { classMap } from 'lit-html/directives/class-map';
import { styleMap } from 'lit-html/directives/style-map';
import ResizeObserver from 'resize-observer-polyfill';
import * as Vibrant from 'node-vibrant';
import MediaPlayerObject from './model';
import style from './style';
import sharedStyle from './sharedStyle';
import handleClick from './utils/handleClick';

import './components/groupList';
import './components/dropdown';
import './components/shortcuts';
import './components/tts';
import './components/progress';
import './components/powerstrip';
import './components/mediaControls';

import {
  DEFAULT_HIDE,
  ICON,
  UPDATE_PROPS,
  BREAKPOINT,
  LABEL_SHORTCUT,
  CONTRAST_RATIO,
  COLOR_SIMILARITY_THRESHOLD,
} from './const';

if (!customElements.get('ha-slider')) {
  customElements.define(
    'ha-slider',
    class extends customElements.get('paper-slider') {},
  );
}

if (!customElements.get('ha-icon-button')) {
  customElements.define(
    'ha-icon-button',
    class extends customElements.get('paper-icon-button') {},
  );
}

if (!customElements.get('ha-icon')) {
  customElements.define(
    'ha-icon',
    class extends customElements.get('iron-icon') {},
  );
}

function luminance(r, g, b) {
  const a = [r, g, b].map((v) => {
    let w = v;
    w /= 255;
    return w <= 0.03928 ? w / 12.92 : ((w + 0.055) / 1.055) ** 2.4;
  });
  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}

function contrast(rgb1, rgb2) {
  const lum1 = luminance(...rgb1);
  const lum2 = luminance(...rgb2);
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  return (brightest + 0.05) / (darkest + 0.05);
}

function getContrastRatio(rgb1, rgb2) {
  return Math.round((contrast(rgb1, rgb2) + Number.EPSILON) * 100) / 100;
}

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
    if (!config.entity || config.entity.split('.')[0] !== 'media_player')
      throw new Error('Specify an entity from within the media_player domain.');

    const conf = {
      artwork: 'default',
      info: 'default',
      more_info: true,
      source: 'default',
      sound_mode: 'default',
      toggle_power: true,
      volume_step: null,
      tap_action: {
        action: 'more-info',
      },
      ...config,
      hide: { ...DEFAULT_HIDE, ...config.hide },
      speaker_group: {
        show_group_count: true,
        platform: 'sonos',
        ...config.sonos,
        ...config.speaker_group,
      },
      shortcuts: {
        label: LABEL_SHORTCUT,
        ...config.shortcuts,
      },
    };
    conf.max_volume = Number(conf.max_volume) || 100;
    conf.min_volume = Number(conf.min_volume) || 0;
    conf.collapse = (conf.hide.controls || conf.hide.volume);
    conf.info = conf.collapse && conf.info !== 'scroll' ? 'short' : conf.info;
    conf.flow = (conf.hide.icon && conf.hide.name && conf.hide.info);

    this.config = conf;
  }

  shouldUpdate(changedProps) {
    if (this.break === undefined) this.computeRect(this);
    if (changedProps.has('prevThumbnail') && this.prevThumbnail) {
      setTimeout(() => {
        this.prevThumbnail = '';
      }, 1000);
    }
    changedProps.has('player') && this.setColors();
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
            }, 250);
          }
          this._resizeEntry = entry;
        });
      });
    });
    ro.observe(this);

    const card = this.shadowRoot.querySelector('ha-card');
    if (card) {
      const cardRo = new ResizeObserver(() => {
        if (!this._cardResizeTimer) {
          this._cardResizeTimer = setTimeout(() => {
            this._cardResizeTimer = null;
            this.measureCard();
          }, 250);
        }
      });
      cardRo.observe(card);
    }

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
          ${this.renderColorBlock()}
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
              .color=${this.foregroundColor}
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
                .color=${this.foregroundColor}
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
                .entity=${this.player.id}>
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

  renderColorBlock() {
    if (this.config.artwork !== 'material')
      return;
    return html`<div class="color-block" style=${styleMap({ backgroundColor: this.backgroundColor || '' })}></div>`;
  }

  renderArtwork(artwork) {
    if (!this.thumbnail && !this.config.background)
      return;

    const url = this.config.background
      && (!artwork || this.config.artwork === 'default')
      ? `url(${this.config.background})`
      : this.thumbnail;

    if (this.config.artwork === 'material')
      return html`<div class='cover' style='background-image: ${url}; background-color: ${this.backgroundColor}; width: ${this.cardHeight}px;'></div>`;

    return html`
      <div class='cover' style='background-image: ${url};'></div>
      ${this.prevThumbnail && html`<div class='cover --prev' style='background-image: ${this.prevThumbnail};'></div>`}`;
  }

  renderGradient() {
    if (this.config.artwork !== 'material')
      return;

    const gradientStyle = {
      'background-image': `linear-gradient(to right, ${
        this.backgroundColor
      }, ${`${this.backgroundColor}00`})`,
      width: `${this.cardHeight}px`,
    };

    return html`<div class="color-gradient" style=${styleMap(gradientStyle)}></div>`;
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

    if (this.player.active && artwork && this.config.artwork === 'material')
      return html`
        <div class='entity__icon' style=${styleMap({ backgroundColor: this.backgroundColor || '' })}>
          <ha-icon .icon=${this.computeIcon()} ></ha-icon>
        </div>`;

    const state = !this.config.hide.icon_state && this.player.isActive;
    return html`
      <div class='entity__icon' ?color=${state}>
        <ha-icon .icon=${this.computeIcon()} ></ha-icon>
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

    if (this.config.artwork === 'material')
      return html`
        <div class='entity__info__media'
          ?short=${this.config.info === 'short' || !this.player.active}
          ?short-scroll=${this.config.info === 'scroll'}
          ?scroll=${this.overflow}
          style='animation-duration: ${this.overflow}s; color: ${this.foregroundColor || ''};'>
          ${this.config.info === 'scroll' ? html`
            <div>
              <div class='marquee'>
                ${items.map(i => html`<span class=${`attr__${i.attr}`}>${i.prefix + i.text}</span>`)}
              </div>
            </div>` : ''}
          ${items.map(i => html`<span class=${`attr__${i.attr}`}>${i.prefix + i.text}</span>`)}
        </div>`;

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

  computeStyles() {
    const { scale } = this.config;
    return styleMap({
      ...(scale && { '--mmp-unit': `${40 * scale}px` }, this.foregroundColor && { '--mmp-text-color': this.foregroundColor }),
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

  fire(type, inDetail, inOptions) {
    const options = inOptions || {};
    const detail = inDetail === null || inDetail === undefined ? {} : inDetail;
    const e = new Event(type, {
      bubbles: options.bubbles === undefined ? true : options.bubbles,
      cancelable: Boolean(options.cancelable),
      composed: options.composed === undefined ? true : options.composed,
    });
    e.detail = detail;
    this.dispatchEvent(e);
    return e;
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

  setColors() {
    if (this.player.picture === this.picture)
      return;

    if (!this.player.picture) {
      this.foregroundColor = '';
      this.backgroundColor = '';
      return;
    }

    new Vibrant(this.player.picture, {
      colorCount: 16,
      generator: this.customGenerator,
    })
      .getPalette()
      .then((result) => {
        [this.foregroundColor, this.backgroundColor] = result;
      })
      .catch((err) => {
        // eslint-disable-next-line no-console
        console.error('Error getting Image Colors', err);
        this.foregroundColor = '';
        this.backgroundColor = '';
      });
  }

  customGenerator(colors) {
    colors.sort((colorA, colorB) => colorB.population - colorA.population);

    const backgroundColor = colors[0];
    let foregroundColor;

    const contrastRatios = new Map();
    function approvedContrastRatio(color) {
      if (!contrastRatios.has(color)) {
        contrastRatios.set(
          color,
          getContrastRatio(backgroundColor.rgb, color.rgb),
        );
      }

      return contrastRatios.get(color) > CONTRAST_RATIO;
    }

    // We take each next color and find one that has better contrast.
    for (let i = 1; i < colors.length && foregroundColor === undefined; i += 1) {
      // If this color matches, score, take it.
      if (approvedContrastRatio(colors[i])) {
        foregroundColor = colors[i].hex;
        break;
      }

      // This color has the wrong contrast ratio, but it is the right color.
      // Let's find similar colors that might have the right contrast ratio

      const currentColor = colors[i];

      for (let j = i + 1; j < colors.length; j += 1) {
        const compareColor = colors[j];

        // difference. 0 is same, 765 max difference
        const diffScore = Math.abs(currentColor.rgb[0] - compareColor.rgb[0])
          + Math.abs(currentColor.rgb[1] - compareColor.rgb[1])
          + Math.abs(currentColor.rgb[2] - compareColor.rgb[2]);

        if (diffScore <= COLOR_SIMILARITY_THRESHOLD) {
          if (approvedContrastRatio(compareColor)) {
            if (approvedContrastRatio(compareColor)) {
              foregroundColor = compareColor.hex;
              break;
            }
          }
        }
      }
    }

    if (foregroundColor === undefined) {
      foregroundColor = backgroundColor.bodyTextColor;
    }

    return [foregroundColor, backgroundColor.hex];
  }
}

customElements.define('mini-media-player', MiniMediaPlayer);
