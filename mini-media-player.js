import { LitElement, html } from 'https://unpkg.com/@polymer/lit-element@^0.6.2/lit-element.js?module';

const MEDIA_INFO = [
  { attr: 'media_title' },
  { attr: 'media_artist' },
  { attr: 'media_series_title' },
  { attr: 'media_season', prefix: 'S' },
  { attr: 'media_episode', prefix: 'E'}
];

const ICON = {
  dropdown: 'mdi:chevron-down',
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
      _overflow: Boolean
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
      this.idle = false;
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
      show_progress: false,
      show_shuffle: false,
      show_source: false,
      show_tts: false,
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
      || changedProps.has('_overflow'));

    if (update) {
      this.active = this._isActive();
      if (this.config.show_progress) this._checkProgress();
      return true;
    }
  }

  updated() {
    if (this.config.scroll_info) this._computeOverflow();
  }

  render({_hass, config, entity} = this) {
    const artwork = this._computeArtwork();

    return html`
      ${this._style()}
      <ha-card ?group=${config.group}
        ?more-info=${config.more_info} ?has-title=${config.title !== ''}
        artwork=${config.artwork} ?has-artwork=${artwork} state=${entity.state}
        ?hide-icon=${config.hide_icon} ?hide-info=${this.config.hide_info}
        @click='${(e) => this._handleMore()}'>
        <div class='bg' ?bg=${config.background}
          style=${artwork ? `background-image: url("${this._computeCover(artwork)}");` : ''}>
        </div>
        <header>${config.title}</header>
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
          <div class='control-row flex flex-wrap justify' ?wrap=${this.config.volume_stateless}>
            ${!config.collapse && this.active ? this._renderControlRow() : ''}
          </div>
          ${config.show_tts ? this._renderTts() : ''}
        </div>
        ${config.show_progress && this._showProgress ? this._renderProgress() : ''}
      </ha-card>`;
  }

  _computeName() {
    return this.config.name || this.entity.attributes.friendly_name;
  }

  _computeCover(artwork) {
    return (artwork && this.config.artwork == 'cover') ? artwork : this.config.background;
  }

  _computeArtwork() {
    return (this.entity.attributes.entity_picture
      && this.entity.attributes.entity_picture != '')
      && this.config.artwork !== 'none'
      && this.active
      ? this.entity.attributes.entity_picture
      : false;
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

  _renderIcon(artwork) {
    if (this.config.hide_icon) return;
    if (this.active && artwork && this.config.artwork == 'default') {
      return html`
        <div class='entity__artwork' ?border=${this.config.artwork_border}
          style='background-image: url("${artwork}")'
          state=${this.entity.state}>
        </div>`;
    }
    return html`
      <div class='entity__icon'>
        <ha-icon icon='${this._computeIcon()}'></ha-icon>
      </div>
    `;
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
    const items = MEDIA_INFO.map(item => {
      return {
        info: this._getAttribute(item.attr),
        prefix: item.prefix || '',
        ...item
      };
    }).filter(item => item.info !== '');

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
      this._renderLabel('state.default.unavailable', 'Unavailable');

    return html`
      <div class='select flex'>
        ${this.active && config.collapse ? this._renderControlRow() : html``}
        <div class='flex right'>
          ${this.idle ? this._renderIdleStatus() : html``}
          ${config.show_source ? this._renderSource() : html``}
          ${!config.hide_power ? this._renderPowerButton() : html``}
        <div>
      </div>`;
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
    this._callService(e, this.config.show_tts + '_say' , options, 'tts');
    input.value = '';
  }

  _handleMore({config} = this) {
    if(config.more_info)
      this._fire('hass-more-info', { entityId: config.entity });
  }

  _handleSource(e) {
    const source = e.target.getAttribute('value');
    const options = { 'source': source };
    this._callService(e, 'select_source' , options);
    this.source = source;
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
    return ( this.entity.state !== 'off'
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
    return items.length !== 0 && !this.config.hide_media_info ? true : false;
  }

  _getAttribute(attr, {entity} = this) {
    return entity.attributes[attr] || '';
  }

  _getLabel(label, fallback = 'unknown') {
    const lang = this._hass.selectedLanguage || this._hass.language;
    const resources = this._hass.resources[lang];
    return (resources && resources[label] ? resources[label] : fallback);
  }

  _style() {
    return html`
      <style>
        div:empty { display: none; }
        ha-card {
          padding: 16px;
          position: relative;
          transition: padding .5s;
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
        ha-card[has-title] {
          padding-top: 0px;
        }
        ha-card[group] {
          background: none;
          box-shadow: none;
          padding: 0;
        }
        ha-card[group][artwork='cover'][has-artwork] {
          padding: 8px 0;
        }
        ha-card[more-info] {
          cursor: pointer;
        }
        ha-card[artwork='cover'][has-artwork] .bg,
        .bg[bg] {
          opacity: 1;
          transition: all .5s ease-in;
        }
        ha-card[artwork='cover'][has-artwork] paper-icon-button,
        ha-card[artwork='cover'][has-artwork] ha-icon,
        ha-card[artwork='cover'][has-artwork] .entity__info,
        ha-card[artwork='cover'][has-artwork] .entity__info__name,
        ha-card[artwork='cover'][has-artwork] paper-button,
        ha-card[artwork='cover'][has-artwork] header,
        ha-card[artwork='cover'][has-artwork] .select span,
        ha-card[artwork='cover'][has-artwork] .source-menu__button[focused] iron-icon {
          color: #FFFFFF;
        }
        ha-card[artwork='cover'][has-artwork] paper-input {
          --paper-input-container-color: #FFFFFF;
          --paper-input-container-input-color: #FFFFFF;
        }
        .bg {
          background: transparent;
          background-size: cover;
          background-repeat: no-repeat;
          background-position: center center;
          opacity: 0;
          transition: all .5s ease-in;
          position: absolute;
          top: 0; right: 0; bottom: 0; left: 0;
        }
        .bg:before {
          background: #000000;
          content: '';
          opacity: 0;
          position: absolute;
          top: 0; left: 0; bottom: 0; right: 0;
          transition: all .5s ease-in;
          visibility: hidden;
        }
        ha-card[artwork='cover'][has-artwork] .bg:before {
          opacity: .5;
          visibility: visible;
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
        .entity__info {
          margin-left: 8px;
          display: block;
          position: relative;
        }
        .rows {
          margin-left: 56px;
          position: relative;
          transition: margin-left 0.25s;
        }
        ha-card[hide-icon] .rows {
          margin-left: 0;
        }
        .entity__info[short] {
          max-height: 40px;
          overflow: hidden;
        }
        .entity__icon {
          color: var(--paper-item-icon-color, #44739e);
        }
        .entity__artwork, .entity__icon {
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
        }
        .entity__info__media {
          color: var(--secondary-text-color);
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
        .entity[inactive] .source-menu__source {
          display: none;
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
        ha-card[artwork='cover'][has-artwork] .entity__info__media,
        paper-icon-button[color] {
          color: var(--accent-color) !important;
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
        .tts__input {
          cursor: text;
          flex: 1;
          -webkit-flex: 1;
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
        }
        .entity__control-row--top paper-slider {
          flex: 1;
        }
        .entity__control-row--top paper-slider {
          height: 40px;
        }
        .vol-control {
          flex: 1;
          min-width: 140px;
          max-height: 40px;
        }
        paper-slider {
          max-width: 400px;
          min-width: 100px;
          width: 100%;
        }
        paper-input {
          opacity: .75;
          --paper-input-container-color: var(--primary-text-color);
          --paper-input-container-focus-color: var(--accent-color);
        }
        paper-input[focused] {
          opacity: 1;
        }
        .source-menu {
          height: 40px;
          line-height: 20px;
          padding: 0;
        }
        .source-menu[focused] iron-icon {
          color: var(--accent-color);
          transform: rotate(180deg);
        }
        .source-menu__button[focused] iron-icon {
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
          bottom: 0;
          height: var(--paper-progress-height, 4px);
          left: 0;
          position: absolute;
          right: 0;
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
          white-space: nowrap;
        }
        ha-card[hide-info] .entity__info,
        ha-card[hide-info] .entity__artwork,
        ha-card[hide-info] .entity__icon {
          display: none;
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
        @media screen and (max-width: 325px) {
          .rows {
            margin-left: 0;
          }
          .source-menu__source {
            display: none;
          }
        }
      </style>
    `;
  }

  getCardSize() {
    return 1;
  }
}

customElements.define('mini-media-player', MiniMediaPlayer);
