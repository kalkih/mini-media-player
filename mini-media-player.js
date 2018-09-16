/* mini-media-player - version: v0.2 */
class MiniMediaPlayer extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._icons = {
      'playing': 'mdi:play',
      'paused': 'mdi:pause',
      'prev': 'mdi:mdi:skip-backward',
      'next': 'mdi:mdi:skip-forward',
      'power': 'mdi:power',
      'muted': 'mdi:volume-off',
      'unmuted': 'mdi:volume-high',
      'send': 'mdi:send'
    }
  }

  set hass(hass) {
    this._hass = hass;
    const entity = hass.states[this._config.entity];
    if (entity && entity.state != this._state) {
      this._state = entity.state;
      if (entity.attributes != this._attributes) this._attributes = entity.attributes;
      this._render(entity);
    } else if (entity && entity.attributes != this._attributes) {
      this._attributes = entity.attributes;
      this._render(entity);
    }
  }

  setConfig(config) {
    if (!config.entity || config.entity.split('.')[0] !== 'media_player') {
      throw new Error('Specify an entity from within the media_player domain.');
    }
    const root = this.shadowRoot;

    config.icon = config.icon || false
    config.more_info = (config.more_info !== false ? true : false);
    config.show_tts = (config.show_tts ? true : false);
    config.artwork_border = (config.artwork_border ? true : false);

    this._card = document.createElement('ha-card');
    const content = document.createElement('div');
    content.id = 'content';
    this._card.setAttribute('group', config.group);
    this._card.setAttribute('more-info', config.more_info);
    this._card.appendChild(content);
    root.appendChild(this._renderStyle());
    root.appendChild(this._card);
    this._config = Object.assign({}, config);
  }

  _render(entity) {
    const config = this._config;
    const root = this.shadowRoot;
    const card = root.lastChild;

    if (config.title) card.header = config.title;
    if (!config.icon) {
      this._config.icon = this._attributes['icon'] || 'mdi:cast';
    }

    if (this._state) {
      root.getElementById('content').innerHTML = `
        <div class='flex justify'>
          <div>
            ${this._renderIcon()}
            ${this._renderMediaInfo()}
          </div>
          <div>
            ${this._state == 'unavailable' ?
              `<span class='status'>Unavailable</span>`
            :
              `<paper-icon-button class='power' icon='${this._icons["power"]}'></paper-icon-button>`
            }
          </div>
        </div>
        ${this._state !== 'off' && this._state !== 'unavailable' ? this._renderMediaControls() : '' }
        ${this._config.show_tts && this._state !== 'unavailable' ? this._renderTts() : '' }
      `;

      card.addEventListener('click', e => {
        e.stopPropagation();
        if (this._config.more_info) {
          this._fire('hass-more-info', { entityId: this._config.entity });
        };
      });
      if (this._state !== 'unavailable') {
        let power = card.querySelector('.power');
        power.addEventListener('click', e => this._callService(e, 'toggle'));

        if (this._state !== 'off') this._setupMediaControls();
        if (this._config.show_tts) this._setupTts();
      };
    }
  }

  _renderIcon() {
    if (this._attributes.entity_picture && this._attributes.entity_picture != '') {
      return `<div class='artwork'
        border='${this._config.artwork_border}'
        state='${this._state}'
        style='background-image: url("${this._attributes.entity_picture}")'>
        </div>`;
    } else {
      return `<div class='icon'><ha-icon icon='${this._config.icon}'> </ha-icon></div>`;
    }
  }

  _renderMediaInfo() {
    return `
      <div class='info'>
        <div class='playername' has-info='${this._hasMediaInfo()}' >${this._getAttribute('friendly_name')}</div>
        <div class='mediainfo'>
          <span class='mediatitle'>${this._getAttribute('media_title')}</span>
          <span class='mediaartist'>${this._getAttribute('media_artist')}</span>
        </div>
      </div>`;
  }

  _renderMediaControls() {
    const volumeSliderValue = this._attributes.volume_level * 100;

    return `
      <div class='flex justify mediacontrols'>
        <div>
          <paper-icon-button class='mute' icon='${this._attributes.is_volume_muted ? this._icons[`muted`] : this._icons[`unmuted`]}'></paper-icon-button>
        </div>
        <paper-slider ${this._attributes.is_volume_muted ? 'disabled' : ''}
          ignore-bar-touch pin role='slider' min='0' max='100' value='${volumeSliderValue}' class='flex'>
        </paper-slider>
        <div class='flex'>
          <paper-icon-button class='prev' icon='${this._icons["prev"]}'></paper-icon-button>
          <paper-icon-button class='play-pause' icon='${this._state == 'playing' ? this._icons['paused'] : this._icons['playing'] }'></paper-icon-button>
          <paper-icon-button class='next' icon='${this._icons["next"]}'></paper-icon-button>
        </div>
      </div>`;
  }

  _renderTts() {
    return `
      <div class='flex justify tts'>
        <paper-input no-label-float placeholder='${this._getLabel('ui.card.media_player.text_to_speak', 'Say')}...' onclick='event.stopPropagation();'></paper-input>
        <div>
          <paper-button>SEND</paper-button>
        </div>
      </div>`;
  }

  _setupMediaControls() {
    const root = this.shadowRoot;
    let mute = root.querySelector('.mute');
    mute.addEventListener('click', e => this._callService(e, 'volume_mute', { is_volume_muted: !this._attributes.is_volume_muted }));

    let slider = root.querySelector('paper-slider');
    slider.addEventListener('change', e => this._handleVolumeChange(e));
    slider.addEventListener('click', e => e.stopPropagation());

    let prev = root.querySelector('.prev');
    let next = root.querySelector('.next');
    let playPause = root.querySelector('.play-pause');
    prev.addEventListener('click', e => this._callService(e, 'media_previous_track'));
    next.addEventListener('click', e => this._callService(e, 'media_next_track'));
    playPause.addEventListener('click', e => this._callService(e, 'media_play_pause'));
  }

  _setupTts() {
    const root = this.shadowRoot;
    const tts = root.querySelector('.tts paper-button');
    tts.addEventListener('click', e => {
      e.stopPropagation();
      const input = root.querySelector('.tts paper-input');
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

  _renderStyle() {
    const css = document.createElement('style');
    css.setAttribute('is', 'custom-style')
    css.textContent = `
      ha-card {
        padding: 16px;
      }
      ha-card[group='true'] {
        background: none;
        box-shadow: none;
        padding: 0;
      }
      ha-card[more-info='true'] {
        cursor: pointer;
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
      .info, .mediacontrols, .tts {
        margin-left: 56px;
      }
      .artwork, .icon {
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
      .artwork[border='true'] {
        border: 2px solid var(--primary-text-color);
        box-sizing: border-box;
        -moz-box-sizing: border-box;
        -webkit-box-sizing: border-box;
      }
      .artwork[state='playing'] {
        border-color: var(--accent-color);
      }
      .playername, .status {
        line-height: 40px;
      }
      .playername[has-info='true'] {
        line-height: 20px;
      }
      .mediainfo {
        color: var(--secondary-text-color);
      }
      .mediainfo > .mediaartist:before {
        content: '- ';
      }
      .mediainfo > span:empty {
        display: none;
      }
      .tts paper-input {
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
    `;
    return css;
  }

  getCardSize() {
    return 1;
  }
}

customElements.define('mini-media-player', MiniMediaPlayer);
