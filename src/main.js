import { LitElement, html } from 'lit-element';
import ResizeObserver from 'resize-observer-polyfill';
import MediaPlayerObject from './model';
import style from './style';
import {
  DEFAULT_HIDE,
  ICON,
  UPDATE_PROPS,
  BREAKPOINT,
} from './const';

if (!customElements.get('mwc-button')) {
  customElements.define(
    'mwc-button',
    class extends customElements.get('paper-button') {},
  );
}

class MiniMediaPlayer extends LitElement {
  constructor() {
    super();
    this._overflow = false;
    this.break = true;
    this.initial = true;
    this.picture = false;
    this.thumbnail = false;
    this.edit = false;
    this.idleView = false;
    this.rtl = false;
  }

  static get properties() {
    return {
      _hass: {},
      config: {},
      entity: {},
      player: {},
      source: String,
      _overflow: Boolean,
      break: Boolean,
      initial: Boolean,
      picture: String,
      thumbnail: String,
      edit: Boolean,
      _progress: Boolean,
      _pos: Number,
      idleView: Boolean,
    };
  }

  static get styles() {
    return style;
  }

  set hass(hass) {
    const entity = hass.states[this.config.entity];
    this._hass = hass;
    if (entity && this.entity !== entity) {
      this.entity = entity;
      this.player = new MediaPlayerObject(hass, this.config, entity);
      this.progress = this.player.hasProgress;
      this.idleView = this.player.idle;
      this.rtl = this._computeRTL(hass);
      if (this.player.trackIdle) this._updateIdle();
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

  set progress(v) {
    if (this._progress !== v) {
      this._progress = v;
      if (this.progress === true) this._updateProgress();
    }
  }

  get progress() {
    return this._progress;
  }

  set pos(v) {
    if (this._pos !== v) this._pos = v;
  }

  get pos() {
    return this._pos;
  }

  setConfig(config) {
    if (!config.entity || config.entity.split('.')[0] !== 'media_player')
      throw new Error('Specify an entity from within the media_player domain.');

    const conf = {
      artwork: 'default',
      info: 'default',
      max_volume: 100,
      more_info: true,
      shortcuts: {},
      source: 'default',
      title: '',
      toggle_power: true,
      ...config,
      hide: { ...DEFAULT_HIDE, ...config.hide },
      speaker_group: {
        show_group_count: true,
        platform: 'sonos',
        ...config.sonos,
        ...config.speaker_group,
      },
    };
    conf.max_volume = Number(conf.max_volume) || 100;
    conf.collapse = (conf.hide.controls || conf.hide.volume);
    conf.info = conf.collapse && conf.info !== 'scroll' ? 'short' : conf.info;
    conf.flow = (conf.hide.icon && conf.hide.name && conf.hide.info);

    this.config = conf;
  }

  shouldUpdate(changedProps) {
    const update = UPDATE_PROPS.some(prop => changedProps.has(prop));
    return update && this.player;
  }

  firstUpdated() {
    const ro = new ResizeObserver((entries) => {
      entries.forEach((entry) => {
        window.requestAnimationFrame(() => {
          if (this.config.info === 'scroll') this._computeOverflow();
          if (!this._resizeTimer) {
            this._computeRect(entry);
            this._resizeTimer = setTimeout(() => {
              this._resizeTimer = null;
              this._computeRect(this._resizeEntry);
            }, 250);
          }
          this._resizeEntry = entry;
        });
      });
    });
    ro.observe(this.shadowRoot.querySelector('.player'));
    setTimeout(() => this.initial = false, 250);
    this.edit = this.config.speaker_group.expanded || false;

    if(this.rtl) {
      this.patchSliderForRTL();
    }
  }

  updated() {
    if (this.config.info === 'scroll')
      setTimeout(() => {
        this._computeOverflow();
      }, 10);

      if(this.rtl) {
        this.patchSliderForRTL();
      }
    }

  disconnectedCallback() {
    clearInterval(this._progressTracker);
  }

  render({ config } = this) {
    const artwork = this._computeArtwork();
    const responsive = this.break ? 'break-width' : config.hide.icon
      ? 'break-icon' : 'none';

    return html`
      <ha-card break=${responsive} ?initial=${this.initial}
        ?bg=${config.background} ?group=${config.group}
        ?more-info=${config.more_info} ?has-title=${config.title !== ''}
        artwork=${config.artwork} ?has-artwork=${artwork} state=${this.player.state}
        ?flow=${config.flow} ?collapse=${config.collapse}
        content=${this.player.content}
        ?rtl=${this.rtl}
        @click=${() => this._handleMore()}>
        <div class='bg'>
          ${this._renderArtwork(artwork)}
        </div>
        <header>${config.title}</header>
        <div class='player'>
          <div class='entity flex' ?inactive=${this.player.idle}>
            ${this._renderIcon(artwork)}
            <div class='entity__info'>
              ${this._renderEntityName()}
              ${this._renderMediaInfo()}
            </div>
            <div class='control-row--top flex'>
              ${this._renderPowerStrip()}
            </div>
          </div>
          <div class='rows'>
            <div class='control-row flex'>
              ${!config.collapse && this.player.active ? this._renderControlRow() : ''}
            </div>
            ${config.shortcuts.buttons ? this._renderButtons() : ''}
            ${config.shortcuts.list ? this._renderList() : ''}
            ${config.tts ? this._renderTts() : ''}
            ${this.edit ? this._renderGroupList() : ''}
          </div>
        </div>
        ${this.progress ? this._renderProgress() : ''}
      </ha-card>`;
  }

  get name() {
    return this.config.name || this.player.name;
  }

  _speakerCount() {
    if (this.config.speaker_group.show_group_count) {
      const count = this.player.groupCount;
      return count > 1 ? ` +${count - 1}` : '';
    }
  }

  _computeArtwork() {
    const { picture, hasArtwork } = this.player;
    if (hasArtwork && picture !== this.picture) {
      this.player.fetchThumbnail().then((res) => {
        this.thumbnail = res;
      });
      this.picture = picture;
    }
    return !!(hasArtwork && this.thumbnail);
  }

  _computeIcon() {
    return this.config.icon
      ? this.config.icon : this.player.icon
      || ICON.DEFAULT;
  }

  _computeOverflow() {
    const ele = this.shadowRoot.querySelector('.marquee');
    if (ele) {
      const status = ele.clientWidth > ele.parentNode.clientWidth;
      this.overflow = status && this.player.active ? 7.5 + (ele.clientWidth / 50) : false;
    }
  }

  _computeRect(entry) {
    const { left, width } = entry.contentRect;
    this.break = (width + left * 2) < BREAKPOINT;
  }

  _computeRTL(hass) {
    const lang = hass.language || "en";
    if (hass.translationMetadata.translations[lang]) {
      return hass.translationMetadata.translations[lang].isRTL || false;
    }
    return false;
  }

  _computeRTLDirection(hass) {
    return this._computeRTL(hass) ? "rtl" : "ltr";
  }

  _renderArtwork(artwork) {
    if (!this.thumbnail && !this.config.background)
      return;

    const url = this.config.background
      && (!artwork || this.config.artwork === 'default')
      ? `url(${this.config.background})`
      : this.thumbnail;

    return html`<div class='cover' style='background-image: ${url};'></div>`;
  }

  _renderIcon(artwork) {
    if (this.config.hide.icon) return;
    if (this.player.active && artwork && this.config.artwork === 'default')
      return html`
        <div class='entity__artwork' ?border=${!this.config.hide.artwork_border}
          style='background-image: ${this.thumbnail};'
          state=${this.player.state}>
        </div>`;

    return html`
      <div class='entity__icon'>
        <ha-icon
          icon=${this._computeIcon()}
          ?color=${!this.config.hide.icon_state && (this.player.active || this.idle)}>
        </ha-icon>
      </div>`;
  }

  _renderPowerButton() {
    return html`
      <paper-icon-button class='power-button'
        .icon=${ICON.POWER}
        @click='${e => this.player.toggle(e)}'
        ?color=${!this.config.hide.power_state && (this.player.active || this.idle)}>
      </paper-icon-button>`;
  }

  _renderButton(icon, service, options = {}, color = false) {
    return html`
      <paper-icon-button .icon=${icon} ?color=${color}
        @click='${e => this._callService(e, service, options)}'>
      </paper-icon-button>`;
  }

  _renderEntityName() {
    if (this.config.hide.name) return;
    return html`
      <div class='entity__info__name'>
        ${this.name} ${this._speakerCount()}
      </div>`;
  }

  _renderMediaInfo() {
    if (this.config.hide.info) return;
    const items = this.player.mediaInfo;
    return html`
      <div class='entity__info__media'
        ?short=${this.config.info === 'short' || !this.player.active}
        ?short-scroll=${this.config.info === 'scroll'} ?scroll=${this.overflow}
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

  _renderProgress() {
    if (this.player.idle) return;
    return html`
      <div class='progress' @click=${e => this._handleSeek(e)}>
        <paper-progress class='transiting' value=${this.pos}
          max=${this.player.mediaDuration}>
        </paper-progress>
      </div>`;
  }

  _renderLabel(label, fallback = 'Unknown') {
    return html`
      <span class='label'>
        ${this._getLabel(label, fallback)}
      </span>`;
  }

  _renderIdleStatus() {
    if (this.player.isPaused)
      return this._renderButton(ICON.PLAY[this.player.isPlaying], 'media_play_pause');
    else
      return this._renderLabel('state.media_player.idle', 'Idle');
  }

  _renderShuffleButton() {
    if (!this.player.supportShuffle) return;
    const shuffle = !this.player.shuffle || false;
    return this._renderButton(ICON.SHUFFLE, 'shuffle_set', { shuffle }, !shuffle);
  }

  _renderPowerStrip({ config } = this) {
    if (this.player.isUnavailable)
      return this._renderLabel('state.default.unavailable', 'Unavailable');

    return html`
      ${this.player.active && config.collapse ? this._renderControlRow() : ''}
      <div class='power-row flex'>
        ${this.player.idle ? this._renderIdleStatus() : ''}
        ${this._renderSource()}
        ${config.speaker_group.entities ? this._renderGroupButton() : ''}
        ${!config.hide.power ? this._renderPowerButton() : ''}
      </div>`;
  }

  _renderGroupButton() {
    return html`
      <paper-icon-button class='group-button' .icon=${ICON.GROUP}
        ?opaque=${this.player.groupCount < 2}
        ?color=${this.edit}
        @click=${e => this._handleGroupButton(e)}>
      </paper-icon-button>`;
  }

  _renderGroupList() {
    const { entities } = this.config.speaker_group;
    const { group, master, isMaster } = this.player;

    return html`
      <div class='speaker-select'>
        <span>Group speakers</span>
        ${entities.map(item => this._renderGroupListItem(item, group, master))}
        <div class='buttons'>
          <mwc-button
            class='speaker-select__button'
            raised
            ?disabled=${group.length < 2}
            @click='${e => this._handleGroupItemChange(e, isMaster ? group : this.config.entity, false)}'>
            ${isMaster ? html`Ungroup` : html`Leave`}
          </mwc-button>
          <mwc-button
            class='speaker-select__button'
            raised
            ?disabled=${!isMaster}
            @click='${e => this._handleGroupItemChange(e, entities.map(item => item.entity_id), true)}'>
            Group all
          </mwc-button>
        </div>
      </div>`;
  }

  _renderGroupListItem(item, group, master) {
    const checked = item.entity_id === this.config.entity
      || group.includes(item.entity_id);
    const disabled = item.entity_id === this.config.entity
      || master !== this.config.entity;

    return html`
      <paper-checkbox
        ?checked=${checked}
        ?disabled=${disabled}
        @click='${e => this._handleGroupItemChange(e, item.entity_id, !checked)}'>
        ${item.name}
        ${item.entity_id === master ? html`<span>(master)</span>` : ''}
      </paper-checkbox>`;
  }

  _renderSource() {
    const { source, sources } = this.player;
    if (sources.length === 0 || this.config.hide.source) return;

    const selected = sources.indexOf(source);
    const button = this.config.source === 'icon' || this.config.collapse || this.break || this.player.idle
      ? html`<paper-icon-button class='source-menu__button' slot='dropdown-trigger' .icon=${ICON.DROPDOWN}></paper-icon-button>`
      : html`
        <mwc-button class='source-menu__button' slot='dropdown-trigger'>
          <span class='source-menu__source' display=${this.config.source}>
            ${this.source || source}
          </span>
          <iron-icon .icon=${ICON.DROPDOWN}></iron-icon>
        </mwc-button>`;
    return html`
      <paper-menu-button class='source-menu' slot='dropdown-trigger'
        .horizontalAlign=${'right'} .verticalAlign=${'top'}
        .verticalOffset=${40} .noAnimations=${true}
        @click='${e => e.stopPropagation()}'>
        ${button}
        <paper-listbox slot='dropdown-content' selected=${selected}
          @click='${e => this._handleSource(e, e.target.getAttribute('value'))}'>
          ${sources.map(item => html`<paper-item value=${item}>${item}</paper-item>`)}
        </paper-listbox>
      </paper-menu-button>`;
  }

  _renderControlRow() {
    return html`
      ${!this.config.hide.volume ? this._renderVolControls() : ''}
      <div class='flex shuffle'>
        ${!this.config.hide.shuffle ? this._renderShuffleButton() : ''}
      </div>
      <div class='flex media-controls'>
        ${!this.config.hide.controls ? this._renderMediaControls() : ''}
      </div>`;
  }

  _renderMediaControls() {
    return html`
      ${this._renderButton(ICON.PREV, 'media_previous_track')}
      ${this._renderButton(ICON.PLAY[this.player.isPlaying], 'media_play_pause')}
      ${this._renderButton(ICON.NEXT, 'media_next_track')}`;
  }

  _renderVolControls() {
    if (this.config.volume_stateless)
      return this._renderVolButtons(this.player.muted);
    else
      return this._renderVolSlider(this.player.muted);
  }

  _renderMuteButton(muted) {
    if (this.config.hide.mute) return;
    switch (this.config.replace_mute) {
      case 'play':
        return this._renderButton(ICON.PLAY[this.player.isPlaying], 'media_play_pause');
      case 'stop':
        return this._renderButton(ICON.STOP, 'media_stop');
      case 'next':
        return this._renderButton(ICON.NEXT, 'media_next_track');
      default:
        return this._renderButton(ICON.MUTE[muted], 'volume_mute', { is_volume_muted: !muted });
    }
  }

  _renderVolSlider(muted = false) {
    return html`
      <div class='vol-control flex'>
        <div>
          ${this._renderMuteButton(muted)}
        </div>
        <paper-slider ?disabled=${muted}
          @change=${e => this.player.setVolume(e)}
          @click=${e => e.stopPropagation()}
          min='0' max=${this.config.max_volume} value=${this.player.vol * 100}
          dir=${this._computeRTLDirection(this.hass)}
          ignore-bar-touch pin>
        </paper-slider>
      </div>`;
  }

  _renderVolButtons(muted = false) {
    return html`
      <div class='vol-control--stateless flex'>
        ${this._renderMuteButton(muted)}
        ${this._renderButton(ICON.VOL_DOWN, 'volume_down')}
        ${this._renderButton(ICON.VOL_UP, 'volume_up')}
      </div>`;
  }

  _renderTts() {
    return html`
      <div class='tts flex justify'>
        <paper-input class='tts__input' no-label-float
          placeholder=${this._getLabel('ui.card.media_player.text_to_speak', 'Say')}...
          @click='${e => e.stopPropagation()}'>
        </paper-input>
        <div>
          <mwc-button class='tts_button' @click='${e => this._handleTts(e)}'>
            SEND
          </mwc-button>
        </div>
      </div>`;
  }

  _renderList() {
    if (this.config.shortcuts.hide_when_off && !this.player.active) return;
    const items = this.config.shortcuts.list;
    return html`
      <paper-menu-button class='media-dropdown'
        noink no-animations horizontal-align vertical-align .noLabelFloat=${true}
        @click='${e => e.stopPropagation()}'>
        <mwc-button class='media-dropdown__button' slot='dropdown-trigger'>
          <div>
          <span class='media-dropdown__label'>
            ${'Select media...'}
          </span>
            <iron-icon class='media-dropdown__icon' .icon=${ICON.DROPDOWN}></iron-icon>
          </div>
        </mwc-button>
        <paper-listbox slot="dropdown-content" class="media-dropdown-trigger">
          ${items.map((item, i) => html`
            <paper-item @click=${e => this._handleShortcut(e, 'list', i)}>
              ${item.icon ? html`<iron-icon .icon=${item.icon}></iron-icon>` : ''}
              ${item.name ? html`<span class='media-label'>${item.name}</span>` : ''}
            </paper-item>`)}
        </paper-listbox>
      </paper-menu-button>`;
  }

  _renderButtons() {
    if (this.config.shortcuts.hide_when_off && !this.player.active) return;
    const items = this.config.shortcuts.buttons;
    return html`
      <div class='media-buttons'>
        ${items.map((item, i) => html`
          <mwc-button dense raised columns=${this.config.shortcuts.columns}
            class='media-buttons__button'
            @click='${e => this._handleShortcut(e, 'buttons', i)}'>
            ${item.icon ? html`<iron-icon .icon=${item.icon}></iron-icon>` : ''}
            ${item.name ? html`<span class='media-label'>${item.name}</span>` : ''}
          </mwc-button>`)}
      </div>`;
  }

  _callService(e, service, inOptions, component = 'media_player') {
    e.stopPropagation();
    const options = {
      entity_id: this.config.entity,
      ...inOptions,
    };
    this.hass.callService(component, service, options);
  }

  _handleSeek(e) {
    const duration = this.player.mediaDuration;
    const pos = (e.offsetX / e.target.offsetWidth) * duration;
    this._callService(e, 'media_seek', { seek_position: pos });
  }

  _handleTts(e) {
    const input = this.shadowRoot.querySelector('.tts paper-input');
    const message = input.value;
    const options = { message };
    const { tts } = this.config;
    if (tts.entity_id)
      options.entity_id = tts.entity_id;
    if (tts.language)
      options.language = tts.language;
    if (tts.platform === 'alexa')
      this.hass.callService('notify', 'alexa_media', {
        message,
        data: { type: tts.type || 'tts' },
        target: options.entity_id || this.config.entity,
      });
    else if (tts.platform === 'sonos')
      this.hass.callService('script', 'sonos_say', {
        sonos_entity: this.config.entity,
        volume: tts.volume || 0.5,
        message,
      });
    else if (tts.platform === 'ga')
      this.hass.callService('notify', 'ga_broadcast', { message });
    else
      this._callService(e, `${tts.platform}_say`, options, 'tts');
    e.stopPropagation();
    input.value = '';
  }

  _handleShortcut(e, entity, i) {
    const { type, id } = this.config.shortcuts[entity][i];
    if (type === 'source')
      return this._handleSource(e, id);
    if (type === 'script')
      return this._callService(e, 'turn_on', { entity_id: id }, 'script');
    const options = {
      media_content_type: type,
      media_content_id: id,
    };
    this._callService(e, 'play_media', options);
  }

  _handleMore() {
    if (!this.config.more_info) return;
    const e = new Event('hass-more-info', { composed: true });
    e.detail = { entityId: this.config.entity };
    this.dispatchEvent(e);
  }

  _handleSource(e, source) {
    this.player.setSource(e, source);
    this.source = source;
  }

  _handleGroupButton(e) {
    e.stopPropagation();
    this.edit = !this.edit;
  }

  _handleGroupItemChange(e, entity, checked) {
    const { platform } = this.config.speaker_group;
    const options = { entity_id: entity };
    if (checked) {
      options.master = this.config.entity;
      this._callService(e, `${platform}_JOIN`, options);
    } else {
      this._callService(e, `${platform}_UNJOIN`, options);
    }
  }

  _updateProgress() {
    this.pos = this.player.progress;
    if (!this._progressTracker)
      this._progressTracker = setInterval(() => this._updateProgress(), 1000);
    if (!this.player.isPlaying) {
      this.progress = 'paused';
      clearInterval(this._progressTracker);
      this._progressTracker = null;
    }
  }

  _updateIdle() {
    if (this._idleTracker) clearTimeout(this._idleTracker);
    const diff = (Date.now() - new Date(this.player.updatedAt).getTime()) / 1000;
    this._idleTracker = setTimeout(() => {
      this.idleView = this.player.checkIdleAfter(this.config.idle_view.after);
      this._idleTracker = null;
    }, ((this.config.idle_view.after * 60) - diff) * 1000);
  }

  _getLabel(label, fallback = 'unknown') {
    const lang = this.hass.selectedLanguage || this.hass.language;
    const resources = this.hass.resources[lang];
    return (resources && resources[label] ? resources[label] : fallback);
  }

  getCardSize() {
    return this.config.collapse ? 1 : 2;
  }

  patchSliderForRTL() {
    const slider = this.shadowRoot.querySelector("paper-slider");
    if (slider && !slider.classList.contains("rtlPatched")) {
      slider.shadowRoot.querySelector("style").appendChild(
        document.createTextNode(`
        :host([dir="rtl"]) #sliderContainer.pin.expand > .slider-knob > .slider-knob-inner::after {
          -webkit-transform: scale(1) translate(0, -17px) scaleX(-1) !important;
          transform: scale(1) translate(0, -17px) scaleX(-1) !important;
          }
        `)
      );

      slider.classList.add("rtlPatched");
    }
  }
}

customElements.define('mini-media-player', MiniMediaPlayer);
