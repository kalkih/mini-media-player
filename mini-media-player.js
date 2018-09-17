/* mini-media-player - version: v0.3 */
class MiniMediaPlayer extends HTMLElement {
  constructor() {
    super();
    this.shadow = this.createShadowRoot();
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

  set hass(hass) {
    this._hass = hass;
    const entity = hass.states[this._config.entity];
    if (!entity) return;
    if (!this.shadowRoot.lastChild) {
      this._attributes = entity.attributes || {};
      this._state = entity.state;
      this._init();
    }
    if (entity.attributes != this._attributes) {
      this._state = entity.state;
      this._attributes = entity.attributes;
      this._update();
    }
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

    this._config = Object.assign({}, config);
  }

  _init() {
    const shadow = this.shadow;
    const config = this._config;
    if (shadow.lastChild) shadow.removeChild(shadow.lastChild);
    if (!config.icon) config.icon = this._attributes['icon'] || 'mdi:cast';

    const template = `
      ${this._style()}
      <ha-card group='${config.group}' more-info='${config.more_info}' has-title='${config.title !== ''}' artwork='${config.artwork}' >
        <div id='artwork-cover'></div>
        <div class='flex justify'>
          <div>
            <div id='artwork' border='${config.artwork_border}'></div>
            <div id='icon'><ha-icon icon='${config.icon}'></ha-icon></div>
            <div class='info'>
              <div id='playername' has-info='false'></div>
              <div id='mediainfo'>
                <span id='mediatitle'></span>
                <span id='mediaartist'></span>
              </div>
            </div>
          </div>
          <div class='state'>
            <span id='unavailable'>${this._getLabel('state.default.unavailable', 'Unavailable')}</span>
            <paper-icon-button id='power-button' icon='${this._icons["power"]}'></paper-icon-button>
          </div>
        </div>
        <div id='mediacontrols' class='flex justify'>
          <div>
            <paper-icon-button id='mute-button' icon='${this._icons[`unmuted`]}'></paper-icon-button>
          </div>
          <paper-slider id='volume-slider' onclick='event.stopPropagation();'
            ignore-bar-touch pin min='0' max='100' value='0' class='flex'>
          </paper-slider>
          <div class='flex'>
            <paper-icon-button id='prev-button' icon='${this._icons["prev"]}'></paper-icon-button>
            <paper-icon-button id='play-button' icon='${this._icons["paused"]}'></paper-icon-button>
            <paper-icon-button id='next-button' icon='${this._icons["next"]}'></paper-icon-button>
          </div>
        </div>
        ${this._renderTts()}
      </ha-card>
    `;

    shadow.innerHTML = template;
    this._setup();
    this._update();
  }

  _update() {
    const shadow = this.shadowRoot;
    const config = this._config;
    const state = this._state;

    const playername = shadow.getElementById('playername');
    const active = (state !== 'off' && state !== 'unavailable');
    const muted = this._attributes.is_volume_muted || false;
    const playing = state == 'playing';
    const has_artwork = (this._attributes.entity_picture && this._attributes.entity_picture != '');

    const powerButton = shadow.getElementById('power-button');
    const artwork = shadow.getElementById('artwork');
    const volumeSliderValue = this._attributes.volume_level * 100;
    const volumeSlider = shadow.getElementById('volume-slider');

    playername.innerHTML = this._getAttribute('friendly_name');
    playername.setAttribute('has-info', this._hasMediaInfo());
    shadow.getElementById('unavailable').style.display = state == 'unavailable' ? '' : 'none';
    powerButton.style.display = state == 'unavailable' ? 'none' : '';
    shadow.getElementById('mediacontrols').style.display = active ? '' : 'none';

    artwork.style.display = (has_artwork && config.artwork == 'default') ? '' : 'none';
    shadow.getElementById('icon').style.display = (has_artwork && config.artwork == 'default') ? 'none' : '';

    // Configuration specific
    if (config.power_color) powerButton.setAttribute('on', active)
    if (config.show_tts) {
      shadow.getElementById('tts').style.display = state == 'unavailable' ? 'none' : '';
    }

    if (!active) return;

    if (has_artwork) {
      if (config.artwork == 'cover') {
        const artworkCover = shadow.getElementById('artwork-cover')
        artworkCover.style.backgroundImage = `url(${this._attributes.entity_picture})`;
        artworkCover.setAttribute('has-artwork', has_artwork);
      } else {
        artwork.setAttribute('state', state);
        artwork.style.backgroundImage = `url(${this._attributes.entity_picture})`;
      }
    }

    shadow.getElementById('mediatitle').innerHTML = this._getAttribute('media_title');
    shadow.getElementById('mediaartist').innerHTML = this._getAttribute('media_artist');

    shadow.getElementById('mute-button').setAttribute('icon', this._icons.mute[muted]);

    volumeSlider.setAttribute('value', volumeSliderValue);
    muted ? volumeSlider.setAttribute('disabled', muted) : volumeSlider.removeAttribute('disabled');

    shadow.getElementById('play-button').setAttribute('icon', this._icons.playing[state == 'playing']);
  }

  _renderTts() {
    if (this._config.show_tts) {
      return `
        <div id='tts' class='flex justify'>
          <paper-input id='tts-input'
            no-label-float
            placeholder='${this._getLabel('ui.card.media_player.text_to_speak', 'Say')}...'
            onclick='event.stopPropagation();'>
          </paper-input>
          <div>
            <paper-button id='tts-send'>SEND</paper-button>
          </div>
        </div>`;
    }
    return '';
  }

  _setup() {
    const card = this.shadow.querySelector('ha-card');
    card.header = this._config.title;

    card.addEventListener('click', e => {
      e.stopPropagation();
      if (this._config.more_info) {
        this._fire('hass-more-info', { entityId: this._config.entity });
      };
    });
    const power = this.shadow.getElementById('power-button');
    power.addEventListener('click', e => this._callService(e, 'toggle'));

    this._setupMediaControls();
    if (this._config.show_tts) this._setupTts();
  }

  _setupMediaControls() {
    const shadow = this.shadowRoot;
    const mute = shadow.getElementById('mute-button');
    mute.addEventListener('click', e => this._callService(e, 'volume_mute', {
      is_volume_muted: !this._attributes.is_volume_muted
    }));

    const slider = shadow.getElementById('volume-slider');
    slider.addEventListener('change', e => this._handleVolumeChange(e));

    const prev = shadow.getElementById('prev-button');
    const next = shadow.getElementById('next-button');
    const playPause = shadow.getElementById('play-button');
    prev.addEventListener('click', e => this._callService(e, 'media_previous_track'));
    next.addEventListener('click', e => this._callService(e, 'media_next_track'));
    playPause.addEventListener('click', e => this._callService(e, 'media_play_pause'));
  }

  _setupTts() {
    const shadow = this.shadowRoot;
    const tts = shadow.getElementById('tts-send');
    tts.addEventListener('click', e => {
      e.stopPropagation();
      const input = shadow.getElementById('tts-input');
      let options = { message: input.value };
      this._callService(e, this._config.show_tts + '_say' , options, 'tts');
      input.value = '';
    });
  }

  _callService(e, service, options, component = 'media_player') {
    e.stopPropagation();
    options = (options === null || options === undefined) ? {} : options;
    options.entity_id = options.entity_id || this._config.entity;
    this._hass.callService(component, service, options);
  }

  _handleVolumeChange(e) {
    e.stopPropagation();
    const volPercentage = parseFloat(e.target.value);
    const vol = volPercentage > 0 ? volPercentage / 100 : 0;
    this._callService(e, 'volume_set', { volume_level: vol })
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

  _hasMediaInfo() {
    if (this._attributes.media_title && this._attributes.media_title !== '') return true;
    if (this._attributes.media_artist && this._attributes.media_artist !== '') return true;
    return false;
  }

  _hasAttribute(attr) {
    if (this._attributes[attr] && this._attributes[attr] !== '') return true;
    return false;
  }

  _getAttribute(attr) {
    return this._attributes[attr] || '';
  }

  _getLabel(label, fallback = 'unknown') {
    const lang = this._hass.selectedLanguage || this._hass.language;
    const resources = this._hass.resources[lang];
    return (resources && resources[label] ? resources[label] : fallback);
  }

  _style() {
    return `
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
        ha-card[artwork='cover'] #artwork-cover[has-artwork='true'] {
          display: block;
        }
        ha-card[artwork='cover'] paper-icon-button,
        ha-card[artwork='cover'] ha-icon,
        ha-card[artwork='cover'] .info,
        ha-card[artwork='cover'] paper-button {
          color: #FFFFFF;
        }
        ha-card[artwork='cover'] paper-input {
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
        #power-button[on='true'] {
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
