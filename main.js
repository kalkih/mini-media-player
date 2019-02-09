import { LitElement, html } from 'lit-element';
import ResizeObserver from 'resize-observer-polyfill';
import style from './style';

const DEFAULT_HIDE = {
  shuffle: true,
  power_state: true,
};
const MEDIA_INFO = [
  { attr: 'media_title' },
  { attr: 'media_artist' },
  { attr: 'media_series_title' },
  { attr: 'media_season', prefix: 'S' },
  { attr: 'media_episode', prefix: 'E' },
  { attr: 'app_name' },
];
const ICON = {
  DEFAULT: 'mdi:cast',
  DROPDOWN: 'mdi:chevron-down',
  GROUP: 'mdi:google-circles-communities',
  MENU: 'mdi:menu-down',
  MUTE: {
    true: 'mdi:volume-off',
    false: 'mdi:volume-high',
  },
  NEXT: 'mdi:skip-next',
  PLAY: {
    true: 'mdi:pause',
    false: 'mdi:play',
  },
  POWER: 'mdi:power',
  PREV: 'mdi:skip-previous',
  SEND: 'mdi:send',
  SHUFFLE: 'mdi:shuffle',
  STOP: 'mdi:stop',
  VOL_DOWN: 'mdi:volume-minus',
  VOL_UP: 'mdi:volume-plus',
};
const UPDATE_PROPS = ['entity', 'source', '_progress', '_pos', '_overflow',
  'break', 'thumbnail', 'edit'];
const PROGRESS_PROPS = ['media_duration', 'media_position', 'media_position_updated_at'];
const BREAKPOINT = 390;

class MiniMediaPlayer extends LitElement {
  constructor() {
    super();
    this._overflow = false;
    this.idle = false;
    this.break = true;
    this.initial = true;
    this.picture = false;
    this.thumbnail = false;
    this.edit = false;
  }

  static get properties() {
    return {
      _hass: {},
      config: {},
      entity: {},
      source: String,
      active: Boolean,
      idle: Boolean,
      _overflow: Boolean,
      break: Boolean,
      initial: Boolean,
      picture: String,
      thumbnail: String,
      edit: Boolean,
      _progress: Boolean,
      _pos: Number,
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
      this.active = this._isActive();
      this.progress = this._hasProgress();
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
      sonos: {
        show_group_count: true,
        ...config.sonos,
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
    return update && this.entity;
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
    this.edit = this.config.sonos.expanded || false;
  }

  updated() {
    if (this.config.info === 'scroll') this._computeOverflow();
  }

  disconnectedCallback() {
    clearInterval(this._progressTracker);
  }

  render({ config, entity } = this) {
    const artwork = this._computeArtwork();
    const responsive = this.break ? 'break-width' : config.hide.icon
      ? 'break-icon' : 'none';

    return html`
      <ha-card break=${responsive} ?initial=${this.initial}
        ?bg=${config.background} ?group=${config.group}
        ?more-info=${config.more_info} ?has-title=${config.title !== ''}
        artwork=${config.artwork} ?has-artwork=${artwork} state=${entity.state}
        ?flow=${config.flow} ?collapse=${config.collapse}
        content=${this._computeContent()}
        @click='${e => this._handleMore(e)}'>
        <div class='bg'>
          ${this._renderArtwork(artwork)}
        </div>
        <header>${config.title}</header>
        <div class='player'>
          <div class='entity flex' ?inactive=${!this.active}>
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
              ${!config.collapse && this.active ? this._renderControlRow() : ''}
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

  _computeContent() {
    return this.entity.attributes.media_content_type || 'none';
  }

  _computeName() {
    return this.config.name || this.entity.attributes.friendly_name;
  }

  _computeNameExtra() {
    const group = this.entity.attributes.sonos_group;
    if (this.config.sonos.show_group_count && group) {
      const num = group.length - 1 || 0;
      return num ? ` +${num}` : '';
    }
  }

  _computeArtwork() {
    const picture = this.entity.attributes.entity_picture;
    const artwork = !!((picture && picture !== '')
      && this.config.artwork !== 'none'
      && this.active
      && !this.idle);

    if (artwork && picture !== this.picture) {
      this._fetchThumbnail();
      this.picture = picture;
    }

    return !!(artwork && this.thumbnail);
  }

  _computeIcon() {
    return this.config.icon
      ? this.config.icon : this.entity.attributes.icon
      || ICON.DEFAULT;
  }

  _computeOverflow() {
    const ele = this.shadowRoot.querySelector('.marquee');
    if (ele) {
      const status = ele.clientWidth > ele.parentNode.clientWidth;
      this.overflow = status && this.active ? 7.5 + (ele.clientWidth / 50) : false;
    }
  }

  _computeRect(entry) {
    const { left, width } = entry.contentRect;
    this.break = (width + left * 2) < BREAKPOINT;
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
    if (this.active && artwork && this.config.artwork === 'default')
      return html`
        <div class='entity__artwork' ?border=${!this.config.hide.artwork_border}
          style='background-image: ${this.thumbnail};'
          state=${this.entity.state}>
        </div>`;

    return html`
      <div class='entity__icon'>
        <ha-icon icon=${this._computeIcon()}></ha-icon>
      </div>`;
  }

  _renderPowerButton() {
    return html`
      <paper-icon-button class='power-button'
        .icon=${ICON.POWER}
        @click='${e => this._handlePower(e)}'
        ?color=${!this.config.hide.power_state && (this.active || this.idle)}>
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
        ${this._computeName()}
        ${this._computeNameExtra()}
      </div>`;
  }

  _renderMediaInfo() {
    if (this.config.hide.info) return;
    const items = MEDIA_INFO.map(item => ({
      text: this._getAttribute(item.attr),
      prefix: '',
      ...item,
    })).filter(item => item.text);
    return html`
      <div class='entity__info__media'
        ?short=${this.config.info === 'short' || !this.active} ?scroll=${this.overflow}
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
    if (this.idle) return;
    return html`
      <div class='progress' @click=${e => this._handleSeek(e)}>
        <paper-progress class='transiting' value=${this.pos}
          max=${this.entity.attributes.media_duration}>
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
    if (this._isPaused())
      return this._renderButton(ICON.PLAY[this._isPlaying()], 'media_play_pause');
    else
      return this._renderLabel('state.media_player.idle', 'Idle');
  }

  _renderShuffleButton() {
    if (typeof this.entity.attributes.shuffle === 'undefined') return;
    const shuffle = !this.entity.attributes.shuffle || false;
    return this._renderButton(ICON.SHUFFLE, 'shuffle_set', { shuffle }, !shuffle);
  }

  _renderPowerStrip({ config } = this) {
    if (this.entity.state === 'unavailable')
      return this._renderLabel('state.default.unavailable', 'Unavailable');

    return html`
      ${this.active && config.collapse ? this._renderControlRow() : ''}
      <div class='power-row flex'>
        ${this.idle ? this._renderIdleStatus() : ''}
        ${this._renderSource()}
        ${config.sonos.entities ? this._renderGroupButton() : ''}
        ${!config.hide.power ? this._renderPowerButton() : ''}
      </div>`;
  }

  _renderGroupButton() {
    const grouped = !this.entity.attributes.sonos_group
      || this.entity.attributes.sonos_group.length <= 1;

    return html`
      <paper-icon-button .icon=${ICON.GROUP}
        ?opaque=${grouped}
        ?color=${this.edit}
        @click='${e => this._handleGroupButton(e)}'>
      </paper-icon-button>`;
  }

  _renderGroupList() {
    const { entities } = this.config.sonos;
    const group = this.entity.attributes.sonos_group || [];
    const master = group[0] || this.config.entity;
    const isMaster = master === this.config.entity;

    return html`
      <div class='speaker-select'>
        <span>Group speakers</span>
        ${entities.map(item => this._renderGroupListItem(item, group, master))}
        <div class='buttons'>
          <paper-button
            raised
            ?disabled=${group.length < 2}
            @click='${e => this._handleGroupItemChange(e, isMaster ? group : this.config.entity, false)}'>
            ${isMaster ? html`Ungroup` : html`Leave`}
          </paper-button>
          <paper-button
            raised
            ?disabled=${!isMaster}
            @click='${e => this._handleGroupItemChange(e, entities.map(item => item.entity_id), true)}'>
            Group all
          </paper-button>
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

  _renderSource({ entity } = this) {
    const sources = entity.attributes.source_list || false;
    if (!sources || this.config.hide.source) return;

    const source = entity.attributes.source || '';
    const selected = sources.indexOf(source);
    return html`
      <paper-menu-button class='source-menu' slot='dropdown-trigger'
        .horizontalAlign=${'right'} .verticalAlign=${'top'}
        .verticalOffset=${40} .noAnimations=${true}
        @click='${e => e.stopPropagation()}'>
        <paper-button class='source-menu__button' slot='dropdown-trigger'>
          <span class='source-menu__source' display=${this.config.source}>
            ${this.source || source}
          </span>
          <iron-icon .icon=${ICON.DROPDOWN}></iron-icon>
        </paper-button>
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
      <div class='flex'>
        ${!this.config.hide.controls ? this._renderMediaControls() : ''}
      </div>`;
  }

  _renderMediaControls() {
    return html`
      ${this._renderButton(ICON.PREV, 'media_previous_track')}
      ${this._renderButton(ICON.PLAY[this._isPlaying()], 'media_play_pause')}
      ${this._renderButton(ICON.NEXT, 'media_next_track')}`;
  }

  _renderVolControls() {
    const muted = this.entity.attributes.is_volume_muted || false;
    if (this.config.volume_stateless)
      return this._renderVolButtons(muted);
    else
      return this._renderVolSlider(muted);
  }

  _renderMuteButton(muted) {
    if (this.config.hide.mute) return;
    const options = { is_volume_muted: !muted };
    switch (this.config.replace_mute) {
      case 'play':
        return this._renderButton(ICON.PLAY[this._isPlaying()], 'media_play_pause');
      case 'stop':
        return this._renderButton(ICON.STOP, 'media_stop');
      case 'next':
        return this._renderButton(ICON.NEXT, 'media_next_track');
      default:
        return this._renderButton(ICON.MUTE[muted], 'volume_mute', options);
    }
  }

  _renderVolSlider(muted = false) {
    const volSliderVal = this.entity.attributes.volume_level * 100;
    return html`
      <div class='vol-control flex'>
        <div>
          ${this._renderMuteButton(muted)}
        </div>
        <paper-slider ?disabled=${muted}
          @change='${e => this._handleVolumeChange(e)}'
          @click='${e => e.stopPropagation()}'
          min='0' max=${this.config.max_volume} value=${volSliderVal}
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
          <paper-button @click='${e => this._handleTts(e)}'>
            SEND
          </paper-button>
        </div>
      </div>`;
  }

  _renderList() {
    if (this.config.shortcuts.hide_when_off && !this.active) return;
    const items = this.config.shortcuts.list;
    return html`
      <paper-menu-button class='media-dropdown'
        noink no-animations horizontal-align vertical-align .noLabelFloat=${true}
        @click='${e => e.stopPropagation()}'>
        <paper-button class='media-dropdown__button' slot='dropdown-trigger'>
          <span class='media-dropdown__label'>
            ${'Select media...'}
          </span>
          <iron-icon class='media-dropdown__icon' .icon=${ICON.MENU}></iron-icon>
        </paper-button>
        <paper-listbox slot="dropdown-content" class="media-dropdown-trigger"
          @click='${e => this._handleQuickSelect(e, 'list', e.target.getAttribute('value'))}'>
          ${items.map((item, i) => html`
            <paper-item value=${i}>
              ${item.icon ? html`<iron-icon .icon=${item.icon}></iron-icon>` : ''}
              ${item.name ? html`<span class='media-label'>${item.name}</span>` : ''}
            </paper-item>`)}
        </paper-listbox>
      </paper-menu-button>`;
  }

  _renderButtons() {
    if (this.config.shortcuts.hide_when_off && !this.active) return;
    const items = this.config.shortcuts.buttons;
    return html`
      <div class='media-buttons'>
        ${items.map((item, i) => html`
          <paper-button raised
            @click='${e => this._handleQuickSelect(e, 'buttons', i)}'>
            ${item.icon ? html`<iron-icon .icon=${item.icon}></iron-icon>` : ''}
            ${item.name ? html`<span class='media-label'>${item.name}</span>` : ''}
          </paper-button>`)}
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

  _handleVolumeChange(e) {
    const volPercentage = parseFloat(e.target.value);
    const vol = volPercentage > 0 ? volPercentage / 100 : 0;
    const entity = this.config.sonos.sync_volume
      ? this.entity.attributes.sonos_group
      : this.config.entity;

    this._callService(e, 'volume_set', {
      entity_id: entity || this.config.entity,
      volume_level: vol,
    });
  }

  _handleSeek(e) {
    const duration = this.entity.attributes.media_duration || 0;
    const pos = (e.offsetX / e.target.offsetWidth) * duration;
    this._callService(e, 'media_seek', { seek_position: pos });
  }

  _handlePower(e) {
    if (this.config.toggle_power)
      return this._callService(e, 'toggle');
    if (this.entity.state === 'off')
      return this._callService(e, 'turn_on');
    else
      this._callService(e, 'turn_off');
  }

  _handleTts(e) {
    const input = this.shadowRoot.querySelector('.tts paper-input');
    const options = { message: input.value };
    if (this.config.tts.entity_id) {
      options.entity_id = this.config.tts.entity_id;
    }
    if (this.config.tts.language) {
      options.language = this.config.tts.language;
    }
    if (this.config.tts.platform === 'alexa')
      this._callService(e, 'alexa_tts', options);
    else
      this._callService(e, `${this.config.tts.platform}_say`, options, 'tts');
    input.value = '';
  }

  _handleQuickSelect(e, entity, i) {
    const { type, id } = this.config.shortcuts[entity][i];
    if (type === 'source') return this._handleSource(e, id);
    const options = {
      media_content_type: type,
      media_content_id: id,
    };
    this._callService(e, 'play_media', options);
  }

  _handleMore(e, { config } = this) {
    if (config.more_info)
      return this._fire('hass-more-info', { entityId: config.entity });
    e.stopPropagation();
  }

  _handleSource(e, source) {
    this._callService(e, 'select_source', { source });
    this.source = source;
  }

  _handleGroupButton(e) {
    e.stopPropagation();
    this.edit = !this.edit;
  }

  _handleGroupItemChange(e, entity, checked) {
    const options = { entity_id: entity };
    if (checked) {
      options.master = this.config.entity;
      this._callService(e, 'SONOS_JOIN', options);
    } else {
      this._callService(e, 'SONOS_UNJOIN', options);
    }
  }

  _fire(type, detail = {}, options = {}) {
    const e = new Event(type, {
      bubbles: options.bubbles === undefined ? true : options.bubbles,
      cancelable: Boolean(options.cancelable),
      composed: options.composed === undefined ? true : options.composed,
    });
    e.detail = detail;
    this.dispatchEvent(e);
    return e;
  }

  _updateProgress() {
    this.pos = this._computeProgress;
    if (!this._progressTracker)
      this._progressTracker = setInterval(() => this._updateProgress(), 1000);
    if (!this._isPlaying()) {
      this.progress = 'paused';
      clearInterval(this._progressTracker);
      this._progressTracker = null;
    }
  }

  _hasProgress() {
    return !this.config.hide.progress
      && !this.idle
      && PROGRESS_PROPS.every(prop => prop in this.entity.attributes);
  }

  get _computeProgress() {
    const updated = this.entity.attributes.media_position_updated_at;
    const pos = this.entity.attributes.media_position;
    return pos + (Date.now() - new Date(updated).getTime()) / 1000.0;
  }

  _isPaused() {
    return this.entity.state === 'paused';
  }

  _isPlaying() {
    return this.entity.state === 'playing';
  }

  _isIdle() {
    return this.entity.state === 'idle';
  }

  _isStandby() {
    return this.entity.state === 'standby';
  }

  _isActive() {
    if (this.config.idle_view) this.idle = this._computeIdle();
    return (this.entity.state !== 'off'
      && this.entity.state !== 'unavailable'
      && !this.idle) || false;
  }

  _computeIdle() {
    const idle = this.config.idle_view;
    if (idle.when_idle && this._isIdle()
      || idle.when_standby && this._isStandby()
      || idle.when_paused && this._isPaused())
      return true;

    const updated = this.entity.attributes.media_position_updated_at;
    if (!updated || !idle.after || this._isPlaying())
      return false;

    const diff = (Date.now() - new Date(updated).getTime()) / 1000;
    if (diff > idle.after * 60)
      return true;

    if (this._inactiveTracker) clearTimeout(this._inactiveTracker);
    this._inactiveTracker = setTimeout(() => {
      this.active = this._isActive();
      this._inactiveTracker = null;
    }, ((idle.after * 60) - diff) * 1000);

    return false;
  }

  _getAttribute(attr) {
    return this.entity.attributes[attr] || '';
  }

  _getLabel(label, fallback = 'unknown') {
    const lang = this.hass.selectedLanguage || this.hass.language;
    const resources = this.hass.resources[lang];
    return (resources && resources[label] ? resources[label] : fallback);
  }

  async _fetchThumbnail() {
    try {
      const { content_type: contentType, content } = await this.hass.callWS({
        type: 'media_player_thumbnail',
        entity_id: this.config.entity,
      });
      this.thumbnail = `url(data:${contentType};base64,${content})`;
    } catch (err) {
      this.thumbnail = false;
    }
  }

  getCardSize() {
    return this.config.collapse ? 1 : 2;
  }
}

customElements.define('mini-media-player', MiniMediaPlayer);
