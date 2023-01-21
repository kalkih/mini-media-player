// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// // @ts-nocheck
import {
  LitElement,
  html,
  customElement,
  property,
  state,
  CSSResultGroup,
  PropertyValues,
  TemplateResult,
} from 'lit-element';
import { classMap } from 'lit-html/directives/class-map';
import { styleMap } from 'lit-html/directives/style-map';
import ResizeObserver from 'resize-observer-polyfill';

import { generateConfig } from './config/config';
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

import { ICON, UPDATE_PROPS, BREAKPOINT } from './const';
import { HomeAssistant, MediaPlayerEntity } from './types';
import { Part } from 'lit-html';
import { MiniMediaPlayerBaseConfiguration, MiniMediaPlayerConfiguration } from './config/types';

@customElement('mini-media-player')
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class MiniMediaPlayer extends LitElement {
  @property({ attribute: false })
  set hass(hass) {
    if (!hass) return;
    const entity = hass.states[this.config.entity] as MediaPlayerEntity;
    this._hass = hass;
    if (entity && this.entity !== entity) {
      this.entity = entity;
      this.player = new MediaPlayerObject(hass, this.config, entity);
      this.rtl = this.computeRTL(hass);
      this.idle = this.player.idle;
      if (this.player.trackIdle) this.updateIdleStatus();
    }
    if (this.config && this.config.speaker_group && this.config.speaker_group.group_mgmt_entity) {
      const altPlayer = hass.states[this.config.speaker_group.group_mgmt_entity] as MediaPlayerEntity;
      if (altPlayer && this.groupMgmtEntity !== altPlayer) {
        this.groupMgmtEntity = altPlayer;
        this.groupMgmtPlayer = new MediaPlayerObject(hass, this.config, altPlayer);
      }
    }
  }

  get hass(): HomeAssistant {
    return this._hass;
  }

  @state() private _overflow?: number;
  @state() private initial = true;
  @state() private picture?: string = undefined;
  @state() private thumbnail = '';
  @state() private prevThumbnail = '';
  @state() private edit = false;
  @state() private rtl = false;
  @state() private cardHeight = 0;
  @state() private foregroundColor = '';
  @state() private backgroundColor = '';

  @state() private config!: MiniMediaPlayerConfiguration;
  @state() private _hass!: HomeAssistant;
  @state() private entity?: MediaPlayerEntity;
  @state() private player!: MediaPlayerObject;
  @state() private idle!: boolean;
  @state() private groupMgmtPlayer?: MediaPlayerObject;
  @state() private groupMgmtEntity?: MediaPlayerEntity;
  @state() private break = false;
  @state() private _resizeEntry?: ResizeObserverEntry;
  @state() private _resizeTimer?: NodeJS.Timeout;
  @state() private _idleTracker?: NodeJS.Timeout;

  public static async getConfigElement() {
    await import('./editor');
    return document.createElement('mini-media-player-editor');
  }

  static get styles(): CSSResultGroup {
    return [sharedStyle, style];
  }

  set overflow(value: number | undefined) {
    if (this._overflow !== value) this._overflow = value;
  }

  get overflow(): number | undefined {
    return this._overflow;
  }

  get name(): string {
    return this.config.name || this.player.name;
  }

  setConfig(config: MiniMediaPlayerBaseConfiguration) {
    this.config = generateConfig(config);
  }

  protected shouldUpdate(changedProps: PropertyValues): boolean {
    if (this.break === undefined) this.computeRect(this);
    if (changedProps.has('prevThumbnail') && this.prevThumbnail) {
      setTimeout(() => {
        this.prevThumbnail = '';
      }, 1000);
    }
    if (changedProps.has('player') && this.config.artwork.includes('material')) {
      this.setColors();
    }
    return UPDATE_PROPS.some((prop) => changedProps.has(prop)) && Boolean(this.player);
  }

  protected firstUpdated() {
    const ro = new ResizeObserver((entries: ResizeObserverEntry[]) => {
      entries.forEach((entry) => {
        window.requestAnimationFrame(() => {
          if (this.config.info === 'scroll') this.computeOverflow();
          if (!this._resizeTimer) {
            this.computeRect(entry);
            this._resizeTimer = setTimeout(() => {
              this._resizeTimer = undefined;
              if (this._resizeEntry) {
                this.computeRect(this._resizeEntry);
                this.measureCard();
              }
            }, 250);
          }
          this._resizeEntry = entry;
        });
      });
    });
    ro.observe(this);

    setTimeout(() => (this.initial = false), 250);
    this.edit = this.config.speaker_group.expanded || false;
  }

  protected updated() {
    if (this.config.info === 'scroll')
      setTimeout(() => {
        this.computeOverflow();
      }, 10);
  }

  render({ config } = this): TemplateResult | void {
    this.computeArtwork();

    return html`
      <ha-card
        class=${this.computeClasses()}
        style=${this.computeStyles()}
        @click=${(e) => this.handlePopup(e)}
        artwork=${config.artwork}
        content=${this.player.content}
      >
        <div class="mmp__bg">${this.renderBackground()} ${this.renderArtwork()} ${this.renderGradient()}</div>
        <div class="mmp-player">
          <div class="mmp-player__core flex" ?inactive=${this.player.idle}>
            ${this.renderIcon()}
            <div class="entity__info">${this.renderEntityName()} ${this.renderMediaInfo()}</div>
            <mmp-powerstrip
              @toggleGroupList=${this.toggleGroupList}
              .hass=${this.hass}
              .player=${this.player}
              .config=${config}
              .groupVisible=${this.edit}
              .idle=${this.idle}
              ?flow=${config.flow}
            >
            </mmp-powerstrip>
          </div>
          <div class="mmp-player__adds">
            ${!config.collapse && this.player.isActive
              ? html`
                  <mmp-media-controls .player=${this.player} .config=${config} .break=${this.break}>
                  </mmp-media-controls>
                `
              : ''}
            <mmp-shortcuts .player=${this.player} .shortcuts=${config.shortcuts}> </mmp-shortcuts>
            ${config.tts
              ? html` <mmp-tts .config=${config.tts} .hass=${this.hass} .player=${this.player}> </mmp-tts> `
              : ''}
            <mmp-group-list
              .hass=${this.hass}
              .visible=${this.edit}
              .entities=${config.speaker_group.entities}
              .player=${this.groupMgmtPlayer ? this.groupMgmtPlayer : this.player}
              >>
            </mmp-group-list>
          </div>
        </div>
        <div class="mmp__container">
          ${this.player.isActive && this.player.hasProgress
            ? html`
                <mmp-progress
                  .player=${this.player}
                  .showTime=${!this.config.hide.runtime}
                  .showRemainingTime=${!this.config.hide.runtime_remaining}
                >
                </mmp-progress>
              `
            : ''}
        </div>
      </ha-card>
    `;
  }

  computeClasses({ config } = this) {
    return classMap({
      '--responsive': this.break || config.hide.icon,
      '--initial': this.initial,
      '--bg': config.background || false,
      '--group': config.group,
      '--more-info': config.tap_action.action !== 'none',
      '--has-artwork': this.player.hasArtwork && this.thumbnail,
      '--flow': config.flow,
      '--collapse': config.collapse,
      '--rtl': this.rtl,
      '--progress': this.player.hasProgress,
      '--runtime': !config.hide.runtime && this.player.hasProgress,
      '--inactive': !this.player.isActive,
    });
  }

  renderArtwork(): TemplateResult | undefined {
    if (!this.thumbnail || this.config.artwork === 'default') return;

    const artworkStyle = {
      backgroundImage: this.thumbnail,
      backgroundColor: this.backgroundColor || '',
      width: this.config.artwork === 'material' && this.player.isActive ? `${this.cardHeight}px` : '100%',
    };
    const artworkPrevStyle = {
      backgroundImage: this.prevThumbnail,
      width: this.config.artwork === 'material' ? `${this.cardHeight}px` : '',
    };

    return html` <div class="cover" style=${styleMap(artworkStyle)}></div>
      ${this.prevThumbnail && html` <div class="cover --prev" style=${styleMap(artworkPrevStyle)}></div> `}`;
  }

  renderGradient(): TemplateResult | undefined {
    if (this.config.artwork !== 'material') return;

    const gradientStyle = {
      backgroundImage: `linear-gradient(to left,
        transparent 0,
        ${this.backgroundColor} ${this.cardHeight}px,
        ${this.backgroundColor} 100%)`,
    };

    return html`<div class="cover-gradient" style=${styleMap(gradientStyle)}></div>`;
  }

  renderBackground(): TemplateResult | undefined {
    if (!this.config.background) return;

    return html`
      <div class="cover --bg" style=${styleMap({ backgroundImage: `url(${this.config.background})` })}></div>
    `;
  }

  handlePopup(e: MouseEvent) {
    e.stopPropagation();
    handleClick(this, this._hass, this.config, this.config.tap_action, this.player.id);
  }

  renderIcon(): TemplateResult | undefined {
    if (this.config.hide.icon) return;
    if (this.player.isActive && this.thumbnail && this.config.artwork === 'default') {
      return html` <div
        class="entity__artwork"
        style="background-image: ${this.thumbnail};"
        ?border=${!this.config.hide.artwork_border}
        state=${this.player.state}
      >
        ${' '}
      </div>`;
    }

    if (this.config.icon_image != undefined) {
      return html` <div class="entity__icon">
        <img src="${this.config.icon_image}" height="100%" />
      </div>`;
    }

    const active = !this.config.hide.icon_state && this.player.isActive;
    return html` <div class="entity__icon" ?color=${active}>
      <ha-state-icon
        .hass=${this.hass}
        .icon=${this.config.icon}
        .state=${this.entity}
        .stateObj=${this.entity}
      ></ha-state-icon>
    </div>`;
  }

  renderEntityName(): TemplateResult | undefined {
    if (this.config.hide.name) return;

    return html` <div class="entity__info__name">${this.name} ${this.speakerCount()}</div>`;
  }

  renderMediaInfo(): TemplateResult | undefined {
    if (this.config.hide.info) return;
    const items = this.player.mediaInfo;

    if (this.config.artwork.includes('square')) {
      const artist = items.find((m) => m.attr === 'media_artist');
      const title = items.find((m) => m.attr === 'media_title');
      return html` <div
        class="entity__info__media"
        style="animation-duration: ${this.overflow}s; padding-bottom: 0.25em;"
      >
        ${!!artist ? html`<span class=${`attr__${artist.attr}`}>${artist.prefix + artist.text}</span><br />` : ''}
        ${!!title ? html`<span class=${`attr__${title.attr}`}>${title.prefix + title.text}</span>` : ''}
      </div>`;
    } else {
      return html` <div
        class="entity__info__media"
        ?short=${this.config.info === 'short' || !this.player.isActive}
        ?short-scroll=${this.config.info === 'scroll'}
        ?scroll=${this.overflow}
        style="animation-duration: ${this.overflow}s;"
      >
        ${this.config.info === 'scroll'
          ? html` <div>
              <div class="marquee">
                ${items.map((i) => html`<span class=${`attr__${i.attr}`}>${i.prefix + i.text}</span>`)}
              </div>
            </div>`
          : ''}
        ${items.map((i) => html`<span class=${`attr__${i.attr}`}>${i.prefix + i.text}</span>`)}
      </div>`;
    }
  }

  speakerCount(): string | undefined {
    if (this.config.speaker_group.show_group_count) {
      const count = this.groupMgmtPlayer ? this.groupMgmtPlayer.groupCount : this.player.groupCount;
      return count > 1 ? ` +${count - 1}` : '';
    }
    return;
  }

  computeStyles(): (part: Part) => void {
    const { scale } = this.config;
    return styleMap({
      ...(scale && { '--mmp-unit': `${40 * scale}px` }),
      ...(this.foregroundColor &&
        this.player.isActive && {
          '--mmp-text-color': this.foregroundColor,
          '--mmp-icon-color': this.foregroundColor,
          '--mmp-icon-active-color': this.foregroundColor,
          '--mmp-accent-color': this.foregroundColor,
          '--paper-slider-container-color': this.foregroundColor,
          '--primary-color': this.backgroundColor,
          '--secondary-text-color': this.foregroundColor,
          '--mmp-media-cover-info-color': this.foregroundColor,
        }),
    });
  }

  async computeArtwork(): Promise<void> {
    const { picture, hasArtwork } = this.player;
    if (hasArtwork && picture !== this.picture) {
      this.picture = picture;
      const artwork = await this.player.fetchArtwork();
      if (this.thumbnail) {
        this.prevThumbnail = this.thumbnail;
      }
      this.thumbnail = artwork || `url(${picture})`;
    }
  }

  measureCard(): void {
    const card = this.shadowRoot?.querySelector('ha-card') as HTMLElement | undefined;
    if (!card) {
      return;
    }

    this.cardHeight = card.offsetHeight;
  }

  computeOverflow(): void {
    const element = this.shadowRoot?.querySelector('.marquee') as HTMLElement | undefined;
    if (element && element.parentNode) {
      const status = element.clientWidth > (element.parentNode as HTMLElement).clientWidth;
      this.overflow = status && this.player.isActive ? 7.5 + element.clientWidth / 50 : undefined;
    }
  }

  private computeRect(entry: ResizeObserverEntry | HTMLElement) {
    if ('contentRect' in entry) {
      const { left, width } = entry.contentRect;
      this.break = width + left * 2 < BREAKPOINT;
    } else {
      const { left, width } = entry.getBoundingClientRect();
      this.break = width + left * 2 < BREAKPOINT;
    }
  }

  computeRTL(hass: HomeAssistant): boolean {
    const lang = hass.language || 'en';
    if (hass.translationMetadata.translations[lang]) {
      return hass.translationMetadata.translations[lang].isRTL || false;
    }
    return false;
  }

  toggleGroupList(): void {
    this.edit = !this.edit;
  }

  updateIdleStatus(): void {
    const delay = this.config?.idle_view?.after;
    if (!delay) {
      return;
    }

    if (this._idleTracker) clearTimeout(this._idleTracker);
    const diff = (Date.now() - new Date(this.player.updatedAt).getTime()) / 1000;
    this._idleTracker = setTimeout(() => {
      this.idle = this.player.checkIdleAfter(delay);
      this.player.idle = this.idle;
      this._idleTracker = undefined;
    }, (delay * 60 - diff) * 1000);
  }

  public getCardSize(): number {
    return this.config.collapse ? 1 : 2;
  }

  async setColors(): Promise<void> {
    if (this.player.picture === this.picture) return;

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

// Configures the preview in the Lovelace card picker
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(window as any).customCards = (window as any).customCards || [];
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(window as any).customCards.push({
  type: 'mini-media-player',
  name: 'Mini Media Player',
  preview: false,
  description: 'A minimalistic yet customizable media player card',
});
