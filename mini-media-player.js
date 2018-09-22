/* mini-media-player - version: v0.6 */
import { LitElement, html } from 'https://unpkg.com/@polymer/lit-element@^0.6.1/lit-element.js?module';

class MiniMediaPlayer extends LitElement {
  constructor() {
    super();
    this._icons = {
      'playing': {
        true: 'mdi:pause',
        false: 'mdi:play'
      },
      'prev': 'mdi:mdi:skip-previous',
      'next': 'mdi:mdi:skip-next',
      'power': 'mdi:power',
      'volume_up': 'mdi:volume-high',
      'volume_down': 'mdi:volume-medium',
      'mute': {
        true: 'mdi:volume-off',
        false: 'mdi:volume-high'
      },
      'send': 'mdi:send',
      'dropdown': 'mdi:chevron-down'
    }
  }

  static get properties() {
    return {
      hass: Object,
      config: Object,

      _source: String
    };
  }

  setConfig(config) {
    if (!config.entity || config.entity.split('.')[0] !== 'media_player') {
      throw new Error('Specify an entity from within the media_player domain.');
    }

    config.title = config.title || '';
    config.icon = config.icon || false;
    config.more_info = (config.more_info !== false ? true : false);
    config.show_tts = config.show_tts || false;
    config.show_source = config.show_source || false;
    config.artwork_border = (config.artwork_border ? true : false);
    config.group = (config.group ? true : false);
    config.power_color = (config.power_color ? true : false);
    config.artwork = config.artwork || 'default';
    config.volume_stateless = (config.volume_stateless ? true : false);
    config.hide_power = config.hide_power || false;

    this.config = config;
  }

  render({hass, config} = this) {
    const entity = hass.states[config.entity];
    if (!entity) {
      return;
    }
    const name = config.name || this._getAttribute(entity, 'friendly_name')
    const attributes = entity.attributes;
    const active = (entity.state !== 'off' && entity.state !== 'unavailable');
    const has_artwork = (attributes.entity_picture && attributes.entity_picture != '');

    if (!config.icon) config.icon = attributes['icon'] || 'mdi:cast';

    return html`
      ${this._style()}
      <ha-card group=${config.group} header=${this.config.title}
        more-info=${config.more_info} ?has-title=${config.title !== ''}
        artwork=${config.artwork} has-artwork=${has_artwork}
        @click='${(e) => this._handleMore()}'>
        <div id='artwork-cover'
          style='background-image: url("${attributes.entity_picture}")'>
        </div>
        <div class='flex justify'>
          <div>
            ${active && has_artwork && config.artwork == 'default' ?
              html`<div id='artwork' border=${config.artwork_border}
                style='background-image: url("${attributes.entity_picture}")'
                state=${entity.state}>
              </div>`
            :
              html`<div id='icon'><ha-icon icon='${config.icon}'></ha-icon></div>`
            }
            <div class='info'>
              <div id='playername' has-info=${this._hasMediaInfo(entity)}>
                ${name}
              </div>
              <div id='mediainfo'>
                <span id='mediatitle'>${this._getAttribute(entity, 'media_title')}</span>
                <span id='mediaartist'>${this._getAttribute(entity, 'media_artist')}</span>
              </div>
            </div>
          </div>
          <div class='power-state'>
            ${entity.state == 'unavailable' ?
              html`
                <span id='unavailable'>
                  ${this._getLabel('state.default.unavailable', 'Unavailable')}
                </span>`
            :
              html`
                <div class='select flex'>
                  ${config.show_source ? this._renderSource(entity) : html``}
                  ${!config.hide_power ? this._renderPower(active) : html``}
                </div>`
            }
          </div>
        </div>
        ${active ? this._renderMediaControls(entity) : html``}
        ${config.show_tts ? this._renderTts() : html``}
      </ha-card>`;
  }

  _renderPower(active) {
    return html`
      <paper-icon-button id='power-button'
        icon=${this._icons["power"]}
        @click='${(e) => this._callService(e, "toggle")}'
        ?color=${this.config.power_color && active}>
      </paper-icon-button>`;
  }

  _renderSource(entity) {
    const sources = entity.attributes['source_list'] || false;
    const source = entity.attributes['source'] || '';

    if (sources) {
      const selected = sources.indexOf(source);
      return html`
        <span id='source' slot='dropdown-trigger'>${this._source || source}</span>
        <paper-menu-button slot='dropdown-trigger'
          @click='${(e) => e.stopPropagation()}'>
          <paper-icon-button icon=${this._icons['dropdown']} slot='dropdown-trigger'></paper-icon-button>
          <paper-listbox id='list' slot='dropdown-content' selected=${selected}
            @click='${(e) => this._handleSource(e)}'>
            ${sources.map(item => html`<paper-item value=${item}>${item}</paper-item>`)}
          </paper-listbox>
        </paper-menu-button>`;
    }
  }

  _renderMediaControls(entity) {
    const playing = entity.state == 'playing';

    return html`
      <div id='mediacontrols' class='flex justify flex-wrap' ?wrap=${this.config.volume_stateless}>
        ${this._renderVolControls(entity)}
        <div class='flex'>
          <paper-icon-button id='prev-button' icon=${this._icons["prev"]}
            @click='${(e) => this._callService(e, "media_previous_track")}'>
          </paper-icon-button>
          <paper-icon-button id='play-button'
            icon=${this._icons.playing[playing]}
            @click='${(e) => this._callService(e, "media_play_pause")}'>
          </paper-icon-button>
          <paper-icon-button id='next-button' icon=${this._icons["next"]}
            @click='${(e) => this._callService(e, "media_next_track")}'>
          </paper-icon-button>
        </div>
      </div>`;
  }

  _renderVolControls(entity) {
    if (this.config.volume_stateless) {
      return this._renderVolButtons(entity);
    } else {
      return this._renderVolSlider(entity);
    }
  }

  _renderVolSlider(entity) {
    const muted = entity.attributes.is_volume_muted || false;
    const volumeSliderValue = entity.attributes.volume_level * 100;

    return html`
      <div>
        <paper-icon-button id='mute-button' icon=${this._icons.mute[muted]}
          @click='${(e) => this._callService(e, "volume_mute", { is_volume_muted: !muted })}'>
        </paper-icon-button>
      </div>
      <paper-slider id='volume-slider' class='flex' ?disabled=${muted}
        @change='${(e) => this._handleVolumeChange(e)}'
        @click='${(e) => this._handleVolumeChange(e)}'
        min='0' max='100' value=${volumeSliderValue} ignore-bar-touch pin >
      </paper-slider>`;
  }

  _renderVolButtons(entity) {
    const muted = entity.attributes.is_volume_muted || false;

    return html`
      <div class='flex'>
        <paper-icon-button id='mute-button' icon=${this._icons.mute[true]}
          @click='${(e) => this._callService(e, "volume_mute", { is_volume_muted: !muted })}'>
        </paper-icon-button>
        <paper-icon-button id='volume-down-button' icon=${this._icons.volume_down}
          @click='${(e) => this._callService(e, "volume_down")}'>
        </paper-icon-button>
        <paper-icon-button id='volume-up-button' icon=${this._icons.volume_up}
          @click='${(e) => this._callService(e, "volume_up")}'>
        </paper-icon-button>
      </div>`;
  }

  _renderTts() {
    return html`
      <div id='tts' class='flex justify'>
        <paper-input id='tts-input' no-label-float
          placeholder=${this._getLabel('ui.card.media_player.text_to_speak', 'Say')}...
          @click='${(e) => e.stopPropagation()}'>
        </paper-input>
        <div>
          <paper-button id='tts-send' @click='${(e) => this._handleTts(e)}'>
            SEND
          </paper-button>
        </div>
      </div>`;
  }

  _callService(e, service, options, component = 'media_player') {
    e.stopPropagation();
    options = (options === null || options === undefined) ? {} : options;
    options.entity_id = options.entity_id || this.config.entity;
    this.hass.callService(component, service, options);
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
    this._source = source;
  }

  _fire(type, detail, options) {
    const node = this.shadowRoot;
    options = options || {};
    detail = (detail === null || detail === undefined) ? {} : detail;
    const e = new Event(type, {
      bubbles: options.bubbles === undefined ? true : options.bubbles,
      cancelable: Boolean(options.cancelable),
      composed: options.composed === undefined ? true : options.composed
    });
    e.detail = detail;
    node.dispatchEvent(e);
    return e;
  }

  _hasMediaInfo(entity, attr) {
    if (entity.attributes.media_title && entity.attributes.media_title !== '')
      return true;
    if (entity.attributes.media_artist && entity.attributes.media_artist !== '')
      return true;
    return false;
  }

  _hasAttribute(entity, attr) {
    if (entity.ettributes[attr] && entity.ettributes[attr] !== '') return true;
    return false;
  }

  _getAttribute(entity, attr) {
    return entity.attributes[attr] || '';
  }

  _getLabel(label, fallback = 'unknown') {
    const lang = this.hass.selectedLanguage || this.hass.language;
    const resources = this.hass.resources[lang];
    return (resources && resources[label] ? resources[label] : fallback);
  }

  _style() {
    return html`
      <style>
        ha-card {
          padding: 16px;
          position: relative;
        }
        ha-card[has-title] #artwork-cover {
          margin-top: 70px;
        }
        ha-card[group='true'] {
          padding: 0;
          background: none;
          box-shadow: none;
        }
        ha-card[group='true'][artwork='cover'][has-artwork='true'] .info {
          margin-top: 12px;
        }
        ha-card[more-info='true'] {
          cursor: pointer;
        }
        ha-card[has-title] {
          padding-top: 0px;
        }
        ha-card[artwork='cover'][has-artwork='true'] #artwork-cover {
          display: block;
        }
        ha-card[artwork='cover'][has-artwork='true'] paper-icon-button,
        ha-card[artwork='cover'][has-artwork='true'] ha-icon,
        ha-card[artwork='cover'][has-artwork='true'] .info,
        ha-card[artwork='cover'][has-artwork='true'] paper-button {
          color: #FFFFFF;
        }
        ha-card[artwork='cover'][has-artwork='true'] paper-input {
          --paper-input-container-color: #FFFFFF;
          --paper-input-container-input-color: #FFFFFF;
        }
        #artwork-cover {
          background-size: cover;
          background-repeat: no-repeat;
          background-position: center center;
          display: none;
          position: absolute;
          top: 0; left: 0; bottom: 0; right: 0;
        }
        #artwork-cover:before {
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
        .justify {
          -webkit-justify-content: space-between;
          justify-content: space-between;
        }
        .flex-wrap[wrap] {
          flex-wrap: wrap;
        }
        .info, #mediacontrols, #tts {
          margin-left: 56px;
          position: relative;
        }
        #power-button[color] {
          color: var(--accent-color);
        }
        #artwork, #icon {
          height: 40px;
          width: 40px;
          background-size: cover;
          background-repeat: no-repeat;
          background-position: center center;
          border-radius: 100%;
          text-align: center;
          line-height: 40px;
          float: left;
        }
        #icon {
          color: var(--paper-item-icon-color, #44739e);
        }
        #artwork[border='true'] {
          border: 2px solid var(--primary-text-color);
          box-sizing: border-box;
          -moz-box-sizing: border-box;
          -webkit-box-sizing: border-box;
        }
        #artwork[state='playing'] {
          border-color: var(--accent-color);
        }
        #playername, .power-state {
          line-height: 40px;
        }
        #playername[has-info='true'] {
          line-height: 20px;
        }
        #mediainfo {
          color: var(--secondary-text-color);
        }
        ha-card[artwork='cover'] #mediainfo {
          color: var(--accent-color);
        }
        #mediaartist:before {
          content: '- ';
        }
        #mediainfo > span:empty {
          display: none;
        }
        #tts paper-input {
          flex: 1;
          -webkit-flex: 1;
          cursor: text;
        }
        paper-button {
          color: var(--primary-text-color);
        }
        paper-input {
          opacity: .75;
          --paper-input-container-color: var(--primary-text-color);
          --paper-input-container-focus-color: var(--accent-color);
        }
        paper-input[focused] {
          opacity: 1;
        }
        paper-menu-button {
          padding: 0;
        }
        paper-menu-button paper-icon-button {
          height: 36px;
          width: 36px;
        }
        .select {
          padding-left: 10px;
        }
        .select span {
          position: relative;
          display: block;
          max-width: 60px;
          width: auto;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
      </style>
    `;
  }

  getCardSize() {
    return 1;
  }
}

customElements.define('mini-media-player', MiniMediaPlayer);
