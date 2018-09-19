import { LitElement, html } from 'https://unpkg.com/@polymer/lit-element@^0.6.1/lit-element.js?module';

class MiniMediaPlayer extends LitElement {
  constructor() {
    super();
    this._icons = {
      'playing': {
        true: 'mdi:pause',
        false: 'mdi:play'
      },
      'prev': 'mdi:mdi:skip-backward',
      'next': 'mdi:mdi:skip-forward',
      'power': 'mdi:power',
      'mute': {
        true: 'mdi:volume-off',
        false: 'mdi:volume-high'
      },
      'send': 'mdi:send'
    }
  }

  static get properties() {
    return {
      hass: Object,
      config: Object,
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
    config.artwork_border = (config.artwork_border ? true : false);
    config.group = (config.group ? true : false);
    config.power_color = (config.power_color ? true : false);
    config.artwork = config.artwork || 'default';

    this.config = config;
  }

  render() {
    const {hass, config} = this;
    const entity = hass.states[config.entity];
    const attributes = entity.attributes;
    if (!config.icon) config.icon = attributes['icon'] || 'mdi:cast';

    const active = (entity.state !== 'off' && entity.state !== 'unavailable');
    const has_artwork = (attributes.entity_picture && attributes.entity_picture != '');

    return html`
      ${this._style()}
      <ha-card hello='true' group="${config.group}"
        more-info=${config.more_info} has-title=${config.title !== ''}
        artwork=${config.artwork} has-artwork=${has_artwork}
        @click='${(e) => config.more_info ? this._fire('hass-more-info', { entityId: config.entity }) : ''}'>
        <div id='artwork-cover'
          style='background-image: url("${attributes.entity_picture}")'>
        </div>
        <div class='flex justify'>
          <div>
            ${active && has_artwork && config.artwork == 'default' ?
              html`<div id='artwork' border='${config.artwork_border}'
                style='background-image: url("${attributes.entity_picture}")'
                state=${entity.state}>
              </div>`
            :
              html`<div id='icon'><ha-icon icon='${config.icon}'></ha-icon></div>`
            }
            <div class='info'>
              <div id='playername' has-info='${this._hasMediaInfo(entity)}'>${this._getAttribute(entity, 'friendly_name')}</div>
              <div id='mediainfo'>
                <span id='mediatitle'>${this._getAttribute(entity, 'media_title')}</span>
                <span id='mediaartist'>${this._getAttribute(entity, 'media_artist')}</span>
              </div>
            </div>
          </div>
          <div class='state'>
            ${entity.state == 'unavailable' ?
              html`<span id='unavailable'>${this._getLabel('state.default.unavailable', 'Unavailable')}</span>`
            :
              html`<paper-icon-button id='power-button' icon='${this._icons["power"]}'
                @click='${(e) => this._callService(e, "toggle")}'
                ?color=${config.power_color && active}>
              </paper-icon-button>`
            }
          </div>
        </div>
        ${active ? this._renderMediaControls(entity) : html``}
        ${config.show_tts ? this._renderTts() : html``}
      </ha-card>`;
  }

  _renderMediaControls(entity) {
    const volumeSliderValue = entity.attributes.volume_level * 100;
    const playing = entity.state == 'playing';
    const muted = entity.attributes.is_volume_muted || false;

    return html`
      <div id='mediacontrols' class='flex justify'>
        <div>
          <paper-icon-button id='mute-button' icon='${this._icons.mute[muted]}'
            @click='${(e) => this._callService(e, "volume_mute", { is_volume_muted: !muted })}'>
          </paper-icon-button>
        </div>
        <paper-slider id='volume-slider' ?disabled=${muted}
          @change='${(e) => this._handleVolumeChange(e)}'
          @click='${(e) => this._handleVolumeChange(e)}'
          ignore-bar-touch pin min='0' max='100' value='${volumeSliderValue}' class='flex'>
        </paper-slider>
        <div class='flex'>
          <paper-icon-button id='prev-button' icon='${this._icons["prev"]}'
            @click='${(e) => this._callService(e, "media_previous_track")}'>
          </paper-icon-button>
          <paper-icon-button id='play-button'
            icon='${this._icons.playing[playing]}'
            @click='${(e) => this._callService(e, "media_play_pause")}'>
          </paper-icon-button>
          <paper-icon-button id='next-button' icon='${this._icons["next"]}'
            @click='${(e) => this._callService(e, "media_next_track")}'>
          </paper-icon-button>
        </div>
      </div>`;
  }

  _renderTts() {
    return html`
      <div id='tts' class='flex justify'>
        <paper-input id='tts-input'
          no-label-float
          placeholder='${this._getLabel('ui.card.media_player.text_to_speak', 'Say')}...'
          @click='${(e) => e.stopPropagation()}'>
        </paper-input>
        <div>
          <paper-button id='tts-send' @click='${(e) => this._handleTts(e)}'>SEND</paper-button>
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
    let options = { message: input.value };
    this._callService(e, this.config.show_tts + '_say' , options, 'tts');
    input.value = '';
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
    if (entity.attributes.media_title && entity.attributes.media_title !== '') return true;
    if (entity.attributes.media_artist && entity.attributes.media_artist !== '') return true;
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
        ha-card[group='true'] {
          padding: 0;
          background: none;
          box-shadow: none;
        }
        ha-card[group='true'][artwork='cover'] .info {
          margin-top: 12px;
        }
        ha-card[more-info='true'] {
          cursor: pointer;
        }
        ha-card[has-title='true'] {
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
        #artwork[border='true'] {
          border: 2px solid var(--primary-text-color);
          box-sizing: border-box;
          -moz-box-sizing: border-box;
          -webkit-box-sizing: border-box;
        }
        #artwork[state='playing'] {
          border-color: var(--accent-color);
        }
        #playername, .state {
          line-height: 40px;
        }
        #playername[has-info='true'] {
          line-height: 20px;
        }
        #mediainfo {
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
      </style>
    `;
  }

  getCardSize() {
    return 1;
  }
}

customElements.define('mini-media-player', MiniMediaPlayer);
