import { LitElement, html } from 'https://unpkg.com/@polymer/lit-element@^0.6.2/lit-element.js?module';
import ResizeObserver from 'https://cdn.jsdelivr.net/npm/resize-observer-polyfill@1.5.0/dist/ResizeObserver.es.js';

const MEDIA_INFO = [
  { attr: 'media_title' },
  { attr: 'media_artist' },
  { attr: 'media_series_title' },
  { attr: 'media_season', prefix: 'S' },
  { attr: 'media_episode', prefix: 'E'}
];

const ICON = {
  dropdown: 'mdi:chevron-down',
  group: 'mdi:google-circles-communities',
  menu: 'mdi:menu-down',
  mute: {
    true: 'mdi:volume-off',
    false: 'mdi:volume-high'
  },
  next: 'mdi:skip-next',
  playing: {
    true: 'mdi:pause',
    false: 'mdi:play'
  },
  power: 'mdi:power',
  prev: 'mdi:skip-previous',
  send: 'mdi:send',
  shuffle: 'mdi:shuffle-variant',
  volume_down: 'mdi:volume-minus',
  volume_up: 'mdi:volume-plus'
};

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
      _hass: Object,
      config: Object,
      entity: Object,
      source: String,
      position: Number,
      active: Boolean,
      idle: Boolean,
      _overflow: Boolean,
      break: Boolean,
      initial: Boolean,
      picture: String,
      thumbnail: String,
      edit: Boolean
    };
  }

  set hass(hass) {
    const entity = hass.states[this.config.entity];
    this._hass = hass;
    if (entity && this.entity !== entity)
      this.entity = entity;
  }

  set overflow(overflow) {
    if (overflow !== this._overflow)
      this._overflow = overflow;
  }

  setConfig(config) {
    if (!config.entity || config.entity.split('.')[0] !== 'media_player')
      throw new Error('Specify an entity from within the media_player domain.');

    const conf = {
      artwork: 'default',
      artwork_border: false,
      background: false,
      consider_idle_after: false,
      consider_pause_idle: false,
      group: false,
      hide_controls: false,
      hide_icon: false,
      hide_info: false,
      hide_media_info: false,
      hide_mute: false,
      hide_power: false,
      hide_volume: false,
      icon: false,
      idle_view: false,
      max_volume: 100,
      more_info: true,
      power_color: false,
      scroll_info: false,
      short_info: false,
      media_buttons: false,
      media_list: false,
      show_progress: false,
      show_shuffle: false,
      show_source: false,
      show_tts: false,
      sonos_grouping: false,
      title: '',
      toggle_power: true,
      volume_stateless: false,
      ...config
    };
    conf.consider_idle_after = Number(conf.consider_idle_after) * 60 || false;
    conf.idle_view = conf.idle_view
      || conf.consider_idle_after
      || conf.consider_pause_idle;
    conf.max_volume = Number(conf.max_volume) || 100;
    conf.collapse = (conf.hide_controls || conf.hide_volume)
    conf.short_info = (conf.short_info || conf.scroll_info || conf.collapse);

    this.config = conf;
  }

  shouldUpdate(changedProps) {
    const update = this.entity
      && (changedProps.has('entity')
      || changedProps.has('source')
      || changedProps.has('position')
      || changedProps.has('_overflow')
      || changedProps.has('break')
      || changedProps.has('thumbnail')
      || changedProps.has('edit'));

    if (update) {
      this.active = this._isActive();
      if (this.config.show_progress) this._checkProgress();
      return true;
    }
  }

  firstUpdated() {
    const ro = new ResizeObserver(entries => {
      for (const entry of entries) {
        window.requestAnimationFrame(() => {
          if (this.config.scroll_info) this._computeOverflow();

          if (!this._resizeTimer) {
            this._computeRect(entry);
            this._resizeTimer = setTimeout(() => {
              this._resizeTimer = null;
              this._computeRect(this._resizeEntry);
            }, 250)
          }
          this._resizeEntry = entry;
        });
      }
    });
    ro.observe(this.shadowRoot.querySelector('.player'));
    setTimeout(() => this.initial = false, 250)
  }

  updated() {
    if (this.config.scroll_info) this._computeOverflow();
  }

  render({_hass, config, entity} = this) {
    const artwork = this._computeArtwork();

    return html`
      ${this._style()}
      <ha-card ?break=${this.break} ?initial=${this.initial}
        ?bg=${config.background} ?group=${config.group}
        ?more-info=${config.more_info} ?has-title=${config.title !== ''}
        artwork=${config.artwork} ?has-artwork=${artwork} state=${entity.state}
        ?hide-icon=${config.hide_icon} ?hide-info=${config.hide_info}
        content=${this._computeContent()} ?collapsed=${config.collapse}
        @click='${(e) => this._handleMore()}'>
        ${this._renderArtwork(artwork)}
        <header>${config.title}</header>
        <div class='player'>
          <div class='entity flex' ?inactive=${!this.active}>
            ${this._renderIcon(artwork)}
            <div class='entity__info' ?short=${config.short_info || !this.active}>
              <div class='entity__info__name' ?has-info=${this._hasMediaInfo()}>
                ${this._computeName()}
              </div>
              ${this._renderMediaInfo()}
            </div>
            <div class='entity__control-row--top flex'>
              ${this._renderPowerStrip()}
            </div>
          </div>
          <div class='rows'>
            <div class='control-row flex flex-wrap justify' ?wrap=${config.volume_stateless}>
              ${!config.collapse && this.active ? this._renderControlRow() : ''}
            </div>
            ${config.media_buttons ? this._renderButtons() : ''}
            ${config.media_list ? this._renderList() : ''}
            ${config.show_tts ? this._renderTts() : ''}
            ${this.edit ? this._renderGroupList() : ''}
          </div>
        </div>
        ${config.show_progress && this._showProgress ? this._renderProgress() : ''}
      </ha-card>`;
  }

  _computeContent() {
    return this.entity.attributes.media_content_type || 'none';
  }

  _computeName() {
    return this.config.name || this.entity.attributes.friendly_name;
  }

  _computeArtwork() {
    const picture = this.entity.attributes.entity_picture;
    const artwork = (picture && picture !== '')
      && this.config.artwork !== 'none'
      && this.active
      && !this.idle
      ? true
      : false;

    if (artwork && picture !== this.picture) {
      this._fetchThumbnail();
      this.picture = picture;
    }

    return artwork && this.thumbnail ? true : false;
  }

  _computeIcon() {
    return this.config.icon
      ? this.config.icon : this.entity.attributes.icon
      || 'mdi:cast';
  }

  _computeOverflow() {
    const ele = this.shadowRoot.querySelector('.marquee');
    if (ele) {
      const status = ele.clientWidth > ele.parentNode.clientWidth;
      this.overflow = status && this.active ? 7.5 + (ele.clientWidth / 50) : false;
    }
  }

  _computeRect(entry) {
    const {left, top, width, height} = entry.contentRect;
    this.break = (width + left * 2) < 350;
  }

  _renderArtwork(artwork) {
    if (!this.thumbnail && !this.config.background)
      return html`<div class='bg'></div>`;

    const url = this.config.background
      && (!artwork || this.config.artwork === 'default')
      ? `url(${this.config.background})`
      : this.thumbnail;

    return html`<div class='bg' style='background-image: ${url};'></div>`;
  }

  _renderIcon(artwork) {
    if (this.config.hide_icon) return;
    if (this.active && artwork && this.config.artwork === 'default')
      return html`
        <div class='entity__artwork' ?border=${this.config.artwork_border}
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
        .icon=${ICON.power}
        @click='${e => this._handlePower(e)}'
        ?color=${this.config.power_color && (this.active || this.idle)}>
      </paper-icon-button>`;
  }

  _renderPlayButton() {
    return html`
      <paper-icon-button .icon=${ICON.playing[this._isPlaying()]}
        @click='${e => this._callService(e, "media_play_pause")}'>
      </paper-icon-button>`;
  }

  _renderMediaInfo() {
    if (this.config.hide_media_info) return;
    let items = MEDIA_INFO.map(item => {
      return {
        info: this._getAttribute(item.attr),
        prefix: item.prefix || '',
        ...item
      };
    }).filter(item => item.info !== '');
    if (items.length === 0 && this.entity.attributes.app_name)
      items.push({
        info: this.entity.attributes.app_name,
        prefix: ''
      });

    return html`
      <div class='entity__info__media' ?scroll=${this._overflow}
        style='animation-duration: ${this._overflow}s;'>
        ${this.config.scroll_info ? html`
          <div>
            <div class='marquee'>
              ${items.map(item => html`<span>${item.prefix + item.info}</span>`)}
            </div>
          </div>` : '' }
          ${items.map(item => html`<span>${item.prefix + item.info}</span>`)}
      </div>`;
  }

  _renderProgress() {
    return html`
      <paper-progress class='progress transiting' value=${this.position}
        max=${this.entity.attributes.media_duration}>
      </paper-progress>`;
  }

  _renderLabel(label, fallback = 'Unknown') {
    return html`
      <span class='label'>
        ${this._getLabel(label, fallback)}
      </span>`;
  }

  _renderIdleStatus() {
    if (this._isPaused())
      return this._renderPlayButton();
    else
      return this._renderLabel('state.media_player.idle', 'Idle');
  }

  _renderShuffle() {
    const shuffle = this.entity.attributes.shuffle || false;
    return html`
      <paper-icon-button class='shuffle' .icon=${ICON.shuffle} ?color=${shuffle}
        @click='${e => this._callService(e, "shuffle_set",
          { shuffle: !shuffle })}'>
      </paper-icon-button>`;
  }

  _renderPowerStrip({config} = this) {
    if (this.entity.state == 'unavailable')
      return this._renderLabel('state.default.unavailable', 'Unavailable');

    return html`
      <div class='select flex'>
        ${this.active && config.collapse ? this._renderControlRow() : html``}
        <div class='flex right'>
          ${this.idle ? this._renderIdleStatus() : html``}
          ${config.show_source ? this._renderSource() : html``}
          ${config.sonos_grouping ? this._renderGroupButton() : html``}
          ${!config.hide_power ? this._renderPowerButton() : html``}
        <div>
      </div>`;
  }

  _renderGroupButton() {
    const grouped = !this.entity.attributes.sonos_group
      || this.entity.attributes.sonos_group.length <= 1

    return html`
      <paper-icon-button .icon=${ICON.group}
        ?opaque=${grouped}
        ?color=${this.edit}
        @click='${e => this._handleGroupButton(e)}'>
      </paper-icon-button>`;
  }

  _renderGroupList() {
    const entities = this.config.sonos_grouping;
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
            @click='${e =>
              this._handleGroupItemChange(e, isMaster ? group : this.config.entity, false)}'>
            ${isMaster ? html`Ungroup` : html`Leave`}
          </paper-button>
          <paper-button
            raised
            ?disabled=${!isMaster}
            @click='${e =>
              this._handleGroupItemChange(e, entities.map(item => item.entity_id), true)}'>
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

  _renderSource({entity} = this) {
    const sources = entity.attributes['source_list'] || false;
    const source = entity.attributes['source'] || '';
    if (!sources) return;

    const selected = sources.indexOf(source);
    return html`
      <paper-menu-button class='source-menu' slot='dropdown-trigger'
        .horizontalAlign=${'right'} .verticalAlign=${'top'}
        .verticalOffset=${40} .noAnimations=${true}
        @click='${(e) => e.stopPropagation()}'>
        <paper-button class='source-menu__button' slot='dropdown-trigger'>
          <span class='source-menu__source' show=${this.config.show_source}>
            ${this.source || source}
          </span>
          <iron-icon .icon=${ICON.dropdown}></iron-icon>
        </paper-button>
        <paper-listbox slot='dropdown-content' selected=${selected}
          @click='${(e) => this._handleSource(e)}'>
          ${sources.map(item => html`<paper-item value=${item}>${item}</paper-item>`)}
        </paper-listbox>
      </paper-menu-button>`;
  }

  _renderControlRow() {
    return html`
      ${!this.config.hide_volume ? this._renderVolControls() : ''}
      <div class='flex'>
        ${this.config.show_shuffle ? this._renderShuffle() : ''}
        ${!this.config.hide_controls ? this._renderMediaControls() : ''}
      </div>`;
  }

  _renderMediaControls() {
    return html`
      <paper-icon-button .icon=${ICON.prev}
        @click='${(e) => this._callService(e, "media_previous_track")}'>
      </paper-icon-button>
      ${this._renderPlayButton()}
      <paper-icon-button .icon=${ICON.next}
        @click='${(e) => this._callService(e, "media_next_track")}'>
      </paper-icon-button>`;
  }

  _renderVolControls() {
    const muted = this.entity.attributes.is_volume_muted || false;
    if (this.config.volume_stateless)
      return this._renderVolButtons(muted);
    else
      return this._renderVolSlider(muted);
  }

  _renderMuteButton(muted) {
    const data = { is_volume_muted: !muted }
    if (!this.config.hide_mute)
      return html`
        <paper-icon-button .icon=${ICON.mute[muted]}
          @click='${(e) => this._callService(e, "volume_mute", data)}'>
        </paper-icon-button>`;
  }

  _renderVolSlider(muted = false) {
    const volSliderVal = this.entity.attributes.volume_level * 100;

    return html`
      <div class='vol-control flex'>
        <div>
          ${this._renderMuteButton(muted)}
        </div>
        <paper-slider ?disabled=${muted}
          @change='${(e) => this._handleVolumeChange(e)}'
          @click='${(e) => e.stopPropagation()}'
          min='0' max=${this.config.max_volume} value=${volSliderVal}
          ignore-bar-touch pin>
        </paper-slider>
      </div>`;
  }

  _renderVolButtons(muted = false) {
    return html`
      <div class='flex'>
        ${this._renderMuteButton(muted)}
        <paper-icon-button .icon=${ICON.volume_down}
          @click='${(e) => this._callService(e, "volume_down")}'>
        </paper-icon-button>
        <paper-icon-button .icon=${ICON.volume_up}
          @click='${(e) => this._callService(e, "volume_up")}'>
        </paper-icon-button>
      </div>`;
  }

  _renderTts() {
    return html`
      <div class='tts flex justify'>
        <paper-input class='tts__input' no-label-float
          placeholder=${this._getLabel('ui.card.media_player.text_to_speak', 'Say')}...
          @click='${(e) => e.stopPropagation()}'>
        </paper-input>
        <div>
          <paper-button @click='${(e) => this._handleTts(e)}'>
            SEND
          </paper-button>
        </div>
      </div>`;
  }

  _renderList() {
    const items = this.config.media_list;
    return html`
      <paper-menu-button class='media-dropdown'
        noink no-animations horizontal-align vertical-align .noLabelFloat=${true}
        @click='${(e) => e.stopPropagation()}'>
        <paper-button class='media-dropdown__button' slot='dropdown-trigger'>
          <span class='media-dropdown__label'>
            ${'Select media...'}
          </span>
          <iron-icon class='media-dropdown__icon' .icon=${ICON.menu}></iron-icon>
        </paper-button>
        <paper-listbox slot="dropdown-content" class="media-dropdown-trigger"
          @click='${e => this._handleSelect(e, 'media_list', e.target.getAttribute('value'))}'>
          ${items.map((item, i) => html`<paper-item value=${i}>${item.name}</paper-item>`)}
        </paper-listbox>
      </paper-menu-button>`;
  }

  _renderButtons() {
    const items = this.config.media_buttons;

    return html`
      <div class='media-buttons'>
        ${items.map((item, i) => html`
          <paper-button raised
            @click='${e => this._handleSelect(e, 'media_buttons', i)}'>
            <span class='media-dropdown__label'>${item.name}</span>
          </paper-button>`
        )}
      </div>`;
  }

  _callService(e, service, options, component = 'media_player') {
    e.stopPropagation();
    options = (options === null || options === undefined) ? {} : options;
    options.entity_id = options.entity_id || this.config.entity;
    this._hass.callService(component, service, options);
  }

  _handleVolumeChange(e) {
    const volPercentage = parseFloat(e.target.value);
    const vol = volPercentage > 0 ? volPercentage / 100 : 0;
    this._callService(e, 'volume_set', { volume_level: vol })
  }

  _handlePower(e) {
    if (this.config.toggle_power) {
      this._callService(e, 'toggle');
    } else {
      if (this.entity.state === 'off')
        this._callService(e, 'turn_on');
      else
        this._callService(e, 'turn_off');
    }
  }

  _handleTts(e) {
    const input = this.shadowRoot.querySelector('.tts paper-input');
    const options = { message: input.value };
    if (this.config.show_tts === 'alexa') {
      this._callService(e, 'alexa_tts' , options);
    } else {
      this._callService(e, this.config.show_tts + '_say' , options, 'tts');
    }
    input.value = '';
  }

  _handleSelect(e, list, id) {
    const options = {
      'media_content_type': this.config[list][id].type,
      'media_content_id': this.config[list][id].url
    };
    this._callService(e, 'play_media' , options);
  }

  _handleMore({config} = this) {
    if(config.more_info)
      this._fire('hass-more-info', { entityId: config.entity });
  }

  _handleSource(e) {
    const source = e.target.getAttribute('value');
    const options = { 'source': source };
    this._callService(e, 'select_source', options);
    this.source = source;
  }

  _handleGroupButton(e) {
    e.stopPropagation();
    this.edit = !this.edit;
  }

  _handleGroupItemChange(e, entity, checked) {
    let options = { entity_id: entity };
    if (checked) {
      options.master = this.config.entity;
      this._callService(e, 'SONOS_JOIN', options);
    } else {
      this._callService(e, 'SONOS_UNJOIN', options);
    }
  }

  _fire(type, detail, options) {
    options = options || {};
    detail = (detail === null || detail === undefined) ? {} : detail;
    const e = new Event(type, {
      bubbles: options.bubbles === undefined ? true : options.bubbles,
      cancelable: Boolean(options.cancelable),
      composed: options.composed === undefined ? true : options.composed
    });
    e.detail = detail;
    this.dispatchEvent(e);
    return e;
  }

  _checkProgress() {
    if (this._isPlaying() && this._showProgress) {
      if (!this._positionTracker) {
        this._positionTracker = setInterval(() =>
          this.position = this._currentProgress, 1000);
      }
    } else if (this._positionTracker) {
      clearInterval(this._positionTracker);
      this._positionTracker = null;
    }
    this.position = this._currentProgress;
  }

  get _showProgress() {
    return (
      (this._isPlaying() || this._isPaused()) && this.active
      && 'media_duration' in this.entity.attributes
      && 'media_position' in this.entity.attributes
      && 'media_position_updated_at' in this.entity.attributes);
  }

  get _currentProgress() {
    const updated = this.entity.attributes.media_position_updated_at;
    const position = this.entity.attributes.media_position;
    return position + (Date.now() - new Date(updated).getTime()) / 1000.0;
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

  _isActive(inactive = false) {
    if (this.config.idle_view)
      this.idle = this._computeIdle();
    return (this.entity.state !== 'off'
      && this.entity.state !== 'unavailable'
      && !this.idle) || false;
  }

  _computeIdle({config} = this) {
    if (config.idle_view && this._isIdle())
      return true
    if (config.consider_pause_idle && this._isPaused())
      return true

    const updated = this.entity.attributes.media_position_updated_at;
    if (!updated || !config.consider_idle_after)
      return false;

    const diff = (Date.now() - new Date(updated).getTime()) / 1000;
    if (diff > config.consider_idle_after)
      return true;

    if (!this._inactiveTracker) {
      this._inactiveTracker = setTimeout(() => {
        this.position = 0;
        this._inactiveTracker = null;
      }, (config.consider_idle_after - diff) * 1000)
    }
    return false;
  }

  _hasMediaInfo() {
    const items = MEDIA_INFO.map(item => {
      return this._getAttribute(item.attr);
    }).filter(item => item !== '');
    return (items.length !== 0 && !this.config.hide_media_info)
      || this.entity.attributes.app_name ? true : false;
  }

  _getAttribute(attr, {entity} = this) {
    return entity.attributes[attr] || '';
  }

  _getLabel(label, fallback = 'unknown') {
    const lang = this._hass.selectedLanguage || this._hass.language;
    const resources = this._hass.resources[lang];
    return (resources && resources[label] ? resources[label] : fallback);
  }

  async _fetchThumbnail() {
    try {
      const { content_type: contentType, content } = await this._hass.callWS({
        type: 'media_player_thumbnail',
        entity_id: this.config.entity,
      });
      this.thumbnail = `url(data:${contentType};base64,${content})`;
    } catch (err) {
      this.thumbnail = false;
    }
  }

  _style() {
    return html`
      <style>
        ha-card {
          display: flex;
          background: transparent;
          min-height: 72px;
          overflow: hidden;
          padding: 0;
          position: relative;
        }
        ha-card[collapsed] {
          overflow: visible;
        }
        ha-card:before {
          content: '';
          padding-top: 0px;
          transition: padding-top .5s;
        }
        ha-card[initial]:before {
          transition: none;
        }
        ha-card[initial] * {
          animation-duration: .00001s;
        }
        header {
          display: none;
        }
        ha-card[has-title] header {
          display: block;
          font-size: var(--paper-font-headline_-_font-size);
          font-weight: var(--paper-font-headline_-_font-weight);
          letter-spacing: var(--paper-font-headline_-_letter-spacing);
          line-height: var(--paper-font-headline_-_line-height);
          padding: 24px 16px 16px;
          position: relative;
        }
        ha-card[group] {
          box-shadow: none;
        }
        .player {
          align-self: flex-end;
          box-sizing: border-box;
          position: relative;
          padding: 16px;
          transition: padding .5s;
          width: 100%;
        }
        ha-card[artwork*='full-cover'][has-artwork] .player {
          position: absolute;
        }
        ha-card[artwork='full-cover'][has-artwork]:before {
          padding-top: 56%;
        }
        ha-card[artwork='full-cover'][has-artwork][content='music']:before {
          padding-top: 100%;
        }
        ha-card[artwork='full-cover-fit'][has-artwork]:before {
          padding-top: 100%;
        }
        .player:before {
          background: var(--paper-card-background-color, white);
          content: '';
          position: absolute;
          top: 0; right: 0; bottom: 0; left: 0;
          transition: background .5s ease-out;
        }
        ha-card[bg] .player:before,
        ha-card[group] .player:before {
          background: transparent;
        }
        ha-card[artwork='cover'][has-artwork] .player:before {
          background: rgba(0,0,0,.5);
        }
        ha-card[artwork*='full-cover'][has-artwork] .player:before {
          background: rgba(0,0,0,.75);
          background: linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 100%);
          top: -10px;
        }
        ha-card[artwork='full-cover-fit'][has-artwork] .bg {
          background-color: black;
          background-size: contain;
        }
        .bg {
          background-size: cover;
          background-repeat: no-repeat;
          background-position: center center;
          display: block !important;
          position: absolute;
          top: 0; right: 0; bottom: 0; left: 0;
        }
        ha-card[group] .player  {
          padding: 0;
        }
        ha-card[group][artwork*='cover'][has-artwork] .player {
          padding: 8px 0;
        }
        ha-card[has-title] .player {
          padding-top: 0;
        }
        ha-card[more-info] {
          cursor: pointer;
        }
        ha-card[artwork*='cover'][has-artwork] paper-icon-button,
        ha-card[artwork*='cover'][has-artwork] ha-icon,
        ha-card[artwork*='cover'][has-artwork] .entity__info,
        ha-card[artwork*='cover'][has-artwork] .entity__info__name,
        ha-card[artwork*='cover'][has-artwork] paper-button,
        ha-card[artwork*='cover'][has-artwork] header,
        ha-card[artwork*='cover'][has-artwork] .select span,
        ha-card[artwork*='cover'][has-artwork] .speaker-select > span,
        ha-card[artwork*='cover'][has-artwork] paper-menu-button paper-button[focused] iron-icon {
          color: #FFFFFF;
          border-color: #FFFFFF;
        }
        ha-card[artwork*='cover'][has-artwork] paper-input {
          --paper-input-container-focus-color: #FFFFFF;
        }
        ha-card[artwork*='cover'][has-artwork] paper-checkbox[disabled] {
          --paper-checkbox-checkmark-color: rgba(0,0,0,.5);
        }
        ha-card[artwork*='cover'][has-artwork] paper-checkbox {
          --paper-checkbox-unchecked-color: #FFFFFF;
          --paper-checkbox-label-color: #FFFFFF;
        }
        ha-card[artwork*='cover'][has-artwork] .media-buttons paper-button,
        ha-card[artwork*='cover'][has-artwork] .speaker-select paper-button {
          background: rgba(255,255,255,.65);
          color: black;
        }
        ha-card[artwork*='cover'][has-artwork] paper-input {
          --paper-input-container-color: #FFFFFF;
          --paper-input-container-input-color: #FFFFFF;
        }
        .flex {
          display: flex;
          display: -ms-flexbox;
          display: -webkit-flex;
          flex-direction: row;
        }
        .flex-wrap[wrap] {
          flex-wrap: wrap;
        }
        .justify {
          -webkit-justify-content: space-between;
          justify-content: space-between;
        }
        .hidden {
          display: none;
        }
        .entity {
          position: relative;
        }
        .entity__info {
          margin-left: 8px;
          display: block;
          position: relative;
          overflow: hidden;
          user-select: none;
        }
        .rows {
          margin-left: 56px;
          position: relative;
        }
        .rows > *:nth-child(2) {
          margin-top: 0px;
        }
        .entity__info[short] {
          max-height: 40px;
          overflow: hidden;
        }
        .entity__icon {
          color: var(--paper-item-icon-color, #44739e);
        }
        .entity__artwork, .entity__icon {
          animation: fade-in .15s ease-out;
          background-position: center center;
          background-repeat: no-repeat;
          background-size: cover;
          border-radius: 100%;
          height: 40px;
          line-height: 40px;
          margin-right: 8px;
          min-width: 40px;
          position: relative;
          text-align: center;
          width: 40px;
          transition: border-color .25s ease-out;
        }
        .entity__artwork[border] {
          border: 2px solid var(--primary-text-color);
          box-sizing: border-box;
          -moz-box-sizing: border-box;
          -webkit-box-sizing: border-box;
        }
        .entity__artwork[state='playing'] {
          border-color: var(--accent-color);
        }
        .entity__info__name {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .entity__info__name[has-info] {
          line-height: 20px;
        }
        .entity__info__name, .entity__control-row--top {
          line-height: 40px;
        }
        .entity__info__name,
        paper-icon-button,
        paper-button,
        .select span {
          color: var(--primary-text-color);
          position: relative;
          transition: background .5s ease-out, color .25s ease-out;
        }
        .entity__info__media {
          color: var(--secondary-text-color);
          max-height: 6em;
          word-break: break-word;
        }
        .entity__info[short] .entity__info__media {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .entity[inactive] .entity__info__media {
          color: var(--primary-text-color);
          opacity: .5;
        }
        .entity[inactive] .entity__info__media {
          max-width: 200px;
        }
        .entity__info__media[scroll] > span {
          visibility: hidden;
        }
        .entity__info__media[scroll] > div {
          animation: move linear infinite;
          animation-duration: inherit;
          overflow: visible;
        }
        .entity__info__media[scroll] .marquee {
          animation: slide linear infinite;
          animation-duration: inherit;
          visibility: visible;
        }
        .entity__info__media[scroll] {
          animation-duration: 10s;
          text-overflow: clip !important;
          mask-image: linear-gradient(to right, transparent 0%, black 5%, black 95%, transparent 100%);
          -webkit-mask-image: linear-gradient(to right, transparent 0%, black 5%, black 95%, transparent 100%);
        }
        .marquee {
          visibility: hidden;
          position: absolute;
          white-space: nowrap;
        }
        ha-card[artwork*='cover'][has-artwork] .entity__info__media,
        paper-icon-button[color] {
          color: var(--accent-color) !important;
        }
        paper-icon-button[opaque] {
          opacity: .5;
        }
        paper-icon-button[color][opaque] {
          opacity: 1;
        }
        paper-icon-button {
          transition: color .25s ease-in-out;
        }
        paper-icon-button.shuffle {
          align-self: center;
          height: 38px;
          min-width: 38px;
          text-align: center;
          width: 38px;
        }
        .entity__info__media span:before {
          content: ' - ';
        }
        .entity__info__media span:first-of-type:before {
          content: '';
        }
        .entity__info__media span:empty,
        .source-menu span:empty {
          display: none;
        }
        .tts {
          align-items: center;
          margin-top: 8px;
        }
        .tts__input {
          cursor: text;
          flex: 1;
          margin-right: 8px;
          --paper-input-container-input: {
            font-size: 1em;
          };
        }
        .tts paper-button {
          margin: 0;
          padding: .4em;
        }
        .media-dropdown {
          box-sizing: border-box;
          padding: 0;
          width: 100%;
          margin-top: 8px;
        }
        .media-dropdown__button {
          border-bottom: 1px solid var(--primary-text-color);
          display: flex;
          font-size: 1em;
          justify-content: space-between;
          margin: 0;
          opacity: .75;
          padding: 0 8px 0 0;
          width: 100%;
          border-radius: 0;
        }
        .media-dropdown[focused] paper-button {
          opacity: 1;
        }
        .media-dropdown[focused] paper-button[focused] {
          opacity: .75;
        }
        .media-dropdown__label {
          overflow: hidden;
          padding: .2em .2em .2em 0;
          text-align: left;
          text-overflow: ellipsis;
          text-transform: none;
          white-space: nowrap;
        }
        .media-dropdown__icon {
          height: 24px;
          width: 24px;
        }
        .media-buttons {
          box-sizing: border-box;
          display: flex;
          flex-wrap: wrap;
          margin-top: 8px;
          padding-top: 8px;
        }
        .media-buttons > paper-button {
          background-color: rgba(255,255,255,0.1);
          border-radius: 0;
          box-sizing: border-box;
          margin: 8px 0 0 0;
          min-width: 0;
          padding: .2em 1em;
          width: calc(50% - 4px);
        }
        .media-buttons > paper-button:nth-child(odd) {
          margin-right: 8px;
        }
        .media-buttons > paper-button:nth-child(-n+2) {
          margin-top: 0;
        }
        .media-buttons > paper-button:nth-last-child(1):nth-child(odd) {
          margin: 8px 0 0 0;
          width: 100%;
        }
        .select .vol-control {
          max-width: 200px;
        }
        .entity__control-row--top,
        .select {
          justify-content: flex-end;
          margin-right: 0;
          margin-left: auto;
          width: auto;
          max-width: 100%;
        }
        .entity__control-row--top paper-slider {
          height: 40px;
          line-height: initial;
        }
        .control-row {
          flex-wrap: wrap;
          justify-content: center;
        }
        .control-row .vol-control {
          margin-right: auto;
        }
        .vol-control {
          flex: 1;
          min-width: 140px;
          max-height: 40px;
        }
        .speaker-select {
          display: flex;
          flex-direction: column;
        }
        .speaker-select > span {
          font-weight: 500;
          margin-top: 12px;
          text-transform: uppercase;
        }
        .speaker-select paper-checkbox {
          padding: 8px 0;
        }
        .speaker-select .buttons {
          display: flex;
          flex-dirction: row;
        }
        .speaker-select paper-button {
          background-color: rgba(255,255,255,0.1);
          margin: 8px 8px 0 0;
          min-width: 0;
          padding: .5em 1em;
          text-transform: uppercase;
          text-align: center;
          width: 50%;
        }
        .speaker-select paper-button[disabled] {
          opacity: .5;
        }
        .speaker-select paper-button:nth-child(even) {
          margin: 8px 0 0 8px;
        }
        .speaker-select > paper-checkbox > span {
          font-weight: 600;
        }
        paper-slider {
          max-width: 400px;
          min-width: 100px;
          width: 100%;
        }
        paper-input {
          opacity: .75;
          --paper-input-container-color: var(--primary-text-color);
          --paper-input-container-focus-color: var(--primary-text-color);
          --paper-input-container: {
            padding: 0;
          };
        }
        paper-input[focused] {
          opacity: 1;
        }
        .source-menu {
          height: 40px;
          line-height: 20px;
          padding: 0;
        }
        paper-menu-button[focused] iron-icon {
          color: var(--accent-color);
          transform: rotate(180deg);
        }
        paper-menu-button paper-button[focused] iron-icon {
          color: var(--primary-text-color);
          transform: rotate(0deg);
        }
        .source-menu__button {
          height: 40px;
          line-height: 20px;
          margin: 0;
          min-width: 0;
          text-transform: initial;
        }
        .source-menu__source {
          display: block;
          max-width: 60px;
          overflow: hidden;
          position: relative;
          text-overflow: ellipsis;
          width: auto;
          white-space: nowrap;
        }
        .source-menu__source[show="small"] {
          display: none;
        }
        .source-menu__source[show="full"] {
          max-width: none;
        }
        paper-progress {
          left: 0; right: 0; bottom: 0;
          height: var(--paper-progress-height, 4px);
          position: absolute;
          width: 100%;
          --paper-progress-active-color: var(--accent-color);
          --paper-progress-container-color: rgba(150,150,150,0.25);
          --paper-progress-transition-duration: 1s;
          --paper-progress-transition-timing-function: linear;
          --paper-progress-transition-delay: 0s;
        }
        ha-card[state='paused'] paper-progress {
          --paper-progress-active-color: var(--disabled-text-color, rgba(150,150,150,.5));
        }
        .label {
          margin: 0 8px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        ha-card[hide-info] .entity__control-row--top,
        ha-card[hide-info] .select {
          justify-content: space-between;
        }
        ha-card[hide-info] .right {
          justify-content: flex-end;
          margin-left: auto;
        }
        ha-card[hide-info] .entity__control-row--top,
        ha-card[hide-info] .select,
        .entity__control-row--top,
        .entity__control-row--top paper-slider,
        .select {
          flex: 1
        }
        ha-card[hide-info] paper-slider,
        ha-card[hide-info] .vol-control {
          width: 100%;
          max-width: none;
        }
        @keyframes slide {
          100% { transform: translateX(-100%); }
        }
        @keyframes move {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        ha-card[break] .rows,
        ha-card[hide-info] .rows,
        ha-card[hide-icon] .rows {
          margin-left: 0;
        }
        ha-card[hide-info] .tts,
        ha-card[hide-icon] .tts,
        ha-card[break] .tts,
        ha-card[hide-info] .media-dropdown,
        ha-card[hide-icon] .media-dropdown,
        ha-card[break] .media-dropdown,
        ha-card[hide-info] .speaker-select,
        ha-card[hide-icon] .speaker-select,
        ha-card[break] .speaker-select {
          padding-left: 8px;
          padding-right: 8px;
        }
        ha-card[hide-info] .media-dropdown__button,
        ha-card[hide-icon] .media-dropdown__button,
        ha-card[break] .media-dropdown__button {
          padding-right: 0;
        }
        div:empty,
        ha-card[break] .source-menu__source,
        ha-card[hide-info] .entity__info,
        ha-card[hide-info] .entity__artwork,
        ha-card[hide-info] .entity__icon,
        .entity[inactive] .source-menu__source {
          display: none;
        }
      </style>
    `;
  }

  getCardSize() {
    return this.config.collapse ? 1 : 2;
  }
}

customElements.define('mini-media-player', MiniMediaPlayer);
