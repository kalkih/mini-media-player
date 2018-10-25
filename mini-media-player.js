/* mini-media-player - version: v0.8.8 */
import { LitElement, html } from 'https://unpkg.com/@polymer/lit-element@^0.6.2/lit-element.js?module';

const MEDIA_INFO = [
  { attr: 'media_title' },
  { attr: 'media_artist' },
  { attr: 'media_series_title' },
  { attr: 'media_season', prefix: 'S' },
  { attr: 'media_episode', prefix: 'E'}
];

const ICON = {
  'prev': 'mdi:skip-previous',
  'next': 'mdi:skip-next',
  'power': 'mdi:power',
  'volume_up': 'mdi:volume-high',
  'volume_down': 'mdi:volume-medium',
  'send': 'mdi:send',
  'dropdown': 'mdi:chevron-down',
  'mute': {
    true: 'mdi:volume-off',
    false: 'mdi:volume-high'
  },
  'playing': {
    true: 'mdi:pause',
    false: 'mdi:play'
  }
};

class MiniMediaPlayer extends LitElement {
  constructor() {
    super();
  }

  static get properties() {
    return {
      _hass: Object,
      config: Object,
      entity: Object,
      source: String,
      position: Number
    };
  }

  set hass(hass) {
    const entity = hass.states[this.config.entity];
    this._hass = hass;
    if (entity && this.entity !== entity)
      this.entity = entity;
  }

  setConfig(config) {
    if (!config.entity || config.entity.split('.')[0] !== 'media_player')
      throw new Error('Specify an entity from within the media_player domain.');

    const conf = Object.assign({
      artwork: 'default',
      artwork_border: false,
      background: false,
      group: false,
      hide_controls: false,
      hide_icon: false,
      hide_info: false,
      hide_mute: false,
      hide_power: false,
      hide_volume: false,
      icon: false,
      max_volume: 100,
      more_info: true,
      power_color: false,
      scroll_info: false,
      short_info: false,
      show_progress: false,
      show_source: false,
      show_tts: false,
      title: '',
      volume_stateless: false
    }, config);
    conf.max_volume = Number(conf.max_volume) || 100;
    conf.short_info = (conf.short_info || conf.scroll_info ? true : false);

    this.config = conf;
  }

  shouldUpdate(changedProps) {
    const change = changedProps.has('entity')
      || changedProps.has('source')
      || changedProps.has('position');
    if (change) {
      if (this.config.show_progress) this._checkProgress();
      return true;
    }
  }

  updated() {
    if (this.config.scroll_info) this._hasOverflow();
  }

  render({_hass, config, entity} = this) {
    if (!entity) return;
    const artwork = this._computeArtwork();
    const hide_controls = (config.hide_controls || config.hide_volume) || false;
    const short = (hide_controls || config.short_info);

    return html`
      ${this._style()}
      <ha-card ?group=${config.group}
        ?more-info=${config.more_info} ?has-title=${config.title !== ''}
        artwork=${config.artwork} ?has-artwork=${artwork} state=${entity.state}
        ?hide-icon=${config.hide_icon} ?hide-info=${this.config.hide_info}
        @click='${(e) => this._handleMore()}'>
        <div class='bg' ?bg=${config.background}
          style='background-image: url("${this._computeBackground()}")'>
        </div>
        <header>${config.title}</header>
        <div class='entity flex'>
          ${this._renderIcon()}
          <div class='entity__info' ?short=${short}>
            <div class='entity__info__name' ?has-info=${this._hasMediaInfo()}>
              ${this._computeName()}
            </div>
            ${this._renderMediaInfo(short)}
          </div>
          <div class='entity__control-row--top flex'>
            ${this._renderPowerStrip(entity)}
          </div>
        </div>
        ${this._isActive() && !hide_controls ? this._renderControlRow(entity) : html``}
        ${config.show_tts ? this._renderTts() : html``}
        ${config.show_progress ? this._renderProgress(entity) : ''}
      </ha-card>`;
  }

  _computeName() {
    return this.config.name || this.entity.attributes.friendly_name;
  }

  _computeBackground() {
    const artwork = this._computeArtwork();
    return artwork && this.config.artwork == "cover" ? artwork : this.config.background;
  }

  _computeArtwork() {
    return (this.entity.attributes.entity_picture
      && this.entity.attributes.entity_picture != '')
      && this.config.artwork !== 'none'
      ? this.entity.attributes.entity_picture
      : false;
  }

  _computeIcon() {
    return this.config.icon
      ? this.config.icon : this.entity.attributes.icon
      || 'mdi:cast';
  }

  _hasOverflow() {
    const element = this.shadowRoot.querySelector('.marquee');
    const status = element.clientWidth > (element.parentNode.clientWidth);
    element.parentNode.parentNode.setAttribute('scroll', status);
  }

  _renderIcon() {
    if (this.config.hide_icon) return;
    const artwork = this._computeArtwork();
    if (this._isActive() && artwork && this.config.artwork == 'default') {
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

  _renderPower() {
    return html`
      <paper-icon-button class='power-button'
        .icon=${ICON['power']}
        @click='${(e) => this._callService(e, "toggle")}'
        ?color=${this.config.power_color && this._isActive()}>
      </paper-icon-button>`;
  }

  _renderMediaInfo(short) {
    const items = MEDIA_INFO.map(item => {
      return Object.assign({
        info: this._getAttribute(item.attr),
        prefix: item.prefix || ''
      }, item);
    }).filter(item => item.info !== '');

    return html`
      <div class='entity__info__media' ?short=${short}>
        ${this.config.scroll_info ? html`
          <div>
            <div class='marquee'>
              ${items.map(item => html`<span>${item.prefix + item.info}</span>`)}
            </div>
          </div>` : '' }
          ${items.map(item => html`<span>${item.prefix + item.info}</span>`)}
      </div>`;
  }

  _renderProgress(entity) {
    const show = this._showProgress();
    return html`
      <paper-progress max=${entity.attributes.media_duration}
        value=${this.position} class='progress transiting ${!show ? "hidden" : ""}'>
      </paper-progress>`;
  }

  _renderPowerStrip(entity, {config} = this) {
    const active = this._isActive();
    if (entity.state == 'unavailable') {
      return html`
        <span class='unavailable'>
          ${this._getLabel('state.default.unavailable', 'Unavailable')}
        </span>`;
    }
    return html`
      <div class='select flex'>
        ${active && config.hide_controls && !config.hide_volume ? this._renderVolControls(entity) : html``}
        ${active && config.hide_volume && !config.hide_controls ? this._renderMediaControls(entity) : html``}
        <div class='flex right'>
          ${config.show_source !== false ? this._renderSource(entity) : html``}
          ${!config.hide_power ? this._renderPower(active) : html``}
        <div>
      </div>`;
  }

  _renderSource(entity) {
    const sources = entity.attributes['source_list'] || false;
    const source = entity.attributes['source'] || '';

    if (sources) {
      const selected = sources.indexOf(source);
      return html`
        <paper-menu-button class='source-menu' slot='dropdown-trigger'
          .horizontalAlign=${'right'} .verticalAlign=${'top'}
          .verticalOffset=${40} .noAnimations=${true}
          @click='${(e) => e.stopPropagation()}'>
          <paper-button class='source-menu__button' slot='dropdown-trigger'>
            ${this.config.show_source !== 'small' ? html`
            <span class='source-menu__source'>${this.source || source}</span>` : '' }
            <iron-icon .icon=${ICON['dropdown']}></iron-icon>
          </paper-button>
          <paper-listbox slot='dropdown-content' selected=${selected}
            @click='${(e) => this._handleSource(e)}'>
            ${sources.map(item => html`<paper-item value=${item}>${item}</paper-item>`)}
          </paper-listbox>
        </paper-menu-button>`;
    }
  }

  _renderControlRow(entity) {
    return html`
      <div class='control-row flex flex-wrap justify' ?wrap=${this.config.volume_stateless}>
        ${this._renderVolControls(entity)}
        ${this._renderMediaControls(entity)}
      </div>`;
  }

  _renderMediaControls(entity) {
    const playing = entity.state == 'playing';
    return html`
      <div class='flex'>
        <paper-icon-button .icon=${ICON["prev"]}
          @click='${(e) => this._callService(e, "media_previous_track")}'>
        </paper-icon-button>
        <paper-icon-button .icon=${ICON.playing[playing]}
          @click='${(e) => this._callService(e, "media_play_pause")}'>
        </paper-icon-button>
        <paper-icon-button .icon=${ICON["next"]}
          @click='${(e) => this._callService(e, "media_next_track")}'>
        </paper-icon-button>
      </div>`;
  }

  _renderVolControls(entity) {
    const muted = entity.attributes.is_volume_muted || false;
    if (this.config.volume_stateless) {
      return this._renderVolButtons(entity, muted);
    } else {
      return this._renderVolSlider(entity, muted);
    }
  }

  _renderMuteButton(muted) {
    if (!this.config.hide_mute)
      return html`
        <paper-icon-button .icon=${ICON.mute[muted]}
          @click='${(e) => this._callService(e, "volume_mute", { is_volume_muted: !muted })}'>
        </paper-icon-button>`;
  }

  _renderVolSlider(entity, muted = false) {
    const volumeSliderValue = entity.attributes.volume_level * 100;

    return html`
      <div class='vol-control flex'>
        <div>
          ${this._renderMuteButton(muted)}
        </div>
        <paper-slider ?disabled=${muted}
          @change='${(e) => this._handleVolumeChange(e)}'
          @click='${(e) => e.stopPropagation()}'
          min='0' max=${this.config.max_volume} value=${volumeSliderValue}
          ignore-bar-touch pin>
        </paper-slider>
      </div>`;
  }

  _renderVolButtons(entity, muted = false) {
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
    options.entity_id = options.entity_id || this.config.entity;
    this._hass.callService(component, service, options);
  }

  _handleVolumeChange(e) {
    e.stopPropagation();
    const volPercentage = parseFloat(e.target.value);
    const vol = volPercentage > 0 ? volPercentage / 100 : 0;
    this._callService(e, 'volume_set', { volume_level: vol })
  }

  _handleTts(e) {
    e.stopPropagation();
    const input = this.shadowRoot.querySelector('#tts paper-input');
    const options = { message: input.value };
    this._callService(e, this.config.show_tts + '_say' , options, 'tts');
    input.value = '';
  }

  _handleMore({config} = this) {
    if(config.more_info)
      this._fire('hass-more-info', { entityId: config.entity });
  }

  _handleSource(e) {
    e.stopPropagation();
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

  async _checkProgress() {
    if (this._isPlaying() && this._showProgress()) {
      if (!this._positionTracker) {
        this._positionTracker = setInterval(() => this.position = this._currentProgress(), 1000);
      }
    } else if (this._positionTracker) {
      clearInterval(this._positionTracker);
      this._positionTracker = null;
    }
    if (this._showProgress) this.position = this._currentProgress();
  }

  _showProgress() {
    return (
      (this._isPlaying() || this._isPaused())
      && 'media_duration' in this.entity.attributes
      && 'media_position' in this.entity.attributes
      && 'media_position_updated_at' in this.entity.attributes);
  }
  _currentProgress() {
    let progress = this.entity.attributes.media_position;
    if (this._isPlaying()) {
      progress += (Date.now() - new Date(this.entity.attributes.media_position_updated_at).getTime()) / 1000.0;
    }
    return progress;
  }

  _isPaused() {
    return this.entity.state === 'paused';
  }

  _isPlaying() {
    return this.entity.state === 'playing';
  }

  _isActive() {
    return (this.entity.state !== 'off' && this.entity.state !== 'unavailable') || false;
  }

  _hasMediaInfo() {
    const items = MEDIA_INFO.map(item => {
      return this._getAttribute(item.attr);
    }).filter(item => item !== '');
    return items.length == 0 ? false : true;
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
        ha-card[group][artwork='cover'][has-artwork] .entity__info {
          margin-top: 10px;
        }
        ha-card[more-info] {
          cursor: pointer;
        }
        ha-card[artwork='cover'][has-artwork] .bg,
        .bg[bg] {
          opacity: 1;
          transition: opacity .5s ease-in;
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
          background-size: cover;
          background-repeat: no-repeat;
          background-position: center center;
          opacity: 0;
          transition: opacity .5s ease-in;
          position: absolute;
          top: 0; right: 0; bottom: 0; left: 0;
        }
        ha-card[artwork='cover'][has-artwork] .bg:before {
          background: #000000;
          content: '';
          opacity: .5;
          position: absolute;
          top: 0; left: 0; bottom: 0; right: 0;
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
        .control-row, .tts {
          margin-left: 56px;
          position: relative;
          transition: margin-left 0.25s;
        }
        ha-card[hide-icon] .control-row,
        ha-card[hide-icon] .tts,
        ha-card[hide-info] .control-row,
        ha-card[hide-info] .tts {
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
        .entity__info__media[short] {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .entity__info__media[scroll='true'] > span {
          visibility: hidden;
        }
        .entity__info__media[scroll='true'] > div {
          animation: move 10s linear infinite;
          overflow: visible;
        }
        .entity__info__media[scroll='true'] .marquee {
          animation: slide 10s linear infinite;
          visibility: visible;
        }
        .entity__info__media[scroll='true'] {
          text-overflow: clip;
          mask-image: linear-gradient(to right, transparent 0%, var(--secondary-text-color) 5%, var(--secondary-text-color) 95%, transparent 100%);
          -webkit-mask-image: linear-gradient(to right, transparent 0%, var(--secondary-text-color) 5%, var(--secondary-text-color) 95%, transparent 100%);
        }
        .marquee {
          visibility: hidden;
          position: absolute;
          white-space: nowrap;
        }
        ha-card[artwork='cover'][has-artwork] .entity__info__media,
        .power-button[color] {
          color: var(--accent-color) !important;
          transition: color .25s ease-in-out;
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
        .entity__control-row--top {
          padding-left: 5px;
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
          min-width: 120px;
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
          padding: 0;
          height: 40px;
        }
        .source-menu[focused] iron-icon {
          transform: rotate(180deg);
            color: var(--accent-color);
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
        ha-card[group] paper-progress {
          position: relative
        }
        .unavailable {
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
        .entity__control-row--top,
        .select,
        ha-card[hide-info] .select {
          flex: 1
        }
        @keyframes slide {
          from {transform: translate(0, 0); }
          to {transform: translate(-100%, 0); }
        }
        @keyframes move {
          from {transform: translate(100%, 0); }
          to {transform: translate(0, 0); }
        }
        @media screen and (max-width: 325px) {
          .control-row, .tts {
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
