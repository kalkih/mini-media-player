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
      'unmuted': 'mdi:volume-high'
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
    if (!config.icon) config.icon = false;
    if (config.more_info !== false) config.more_info = true;

    this._card = document.createElement('ha-card');
    const content = document.createElement('div');
    content.id = 'content';
    if (config.group) {
      content.setAttribute('group', 'true');
      this._card.setAttribute('style', 'box-shadow: none; background: none;');
    }
    this._card.style.cursor = config.more_info ? 'pointer' : 'default';
    this._card.appendChild(this._renderStyle());
    this._card.appendChild(content);
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
      `;

      card.addEventListener('click', e => {
        e.stopPropagation();
        if (this._config.more_info) {
          this._fire('hass-more-info', { entityId: this._config.entity });
        };
      });
      if (this._state !== 'unavailable') {
        let power = card.querySelector('.power');
        power.addEventListener('click', e => this._toggle(e));

        if (this._state !== 'off') this._setupMediaControls();
      };
    }
  }

  _renderIcon() {
    if (this._attributes.entity_picture && this._attributes.entity_picture != '') {
      return `<div class='artwork' style='background-image: url("${this._attributes.entity_picture}")'></div>`;
    } else {
      return `<div class='artwork'><ha-icon icon='${this._config.icon}'> </ha-icon></div>`;
    }
  }

  _renderMediaInfo() {
    return `
      <div class='info'>
        <div class='playername' ${this._hasMediaInfo() ? `has-info='true'` : '' } >${this._getAttribute('friendly_name')}</div>
        <div class='mediainfo'>
          ${this._hasAttribute('media_title') ? `<span class='mediatitle'>${this._getAttribute('media_title')}</span>` : '' }
          ${this._hasAttribute('media_artist') ? `<span class='mediaartist'>- ${this._getAttribute('media_artist')}</span>` : '' }
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

  _setupMediaControls() {
    const root = this.shadowRoot;
    let mute = root.querySelector('.mute');
    mute.addEventListener('click', e => this._toggleMute(e));

    let slider = root.querySelector('paper-slider');
    slider.addEventListener('change', e => this._handleVolumeChange(e));
    slider.addEventListener('click', e => this._handleVolumeChange(e));

    let prev = root.querySelector('.prev');
    let next = root.querySelector('.next');
    let playPause = root.querySelector('.play-pause');
    prev.addEventListener('click', e => this._callService(e, 'media_previous_track'));
    next.addEventListener('click', e => this._callService(e, 'media_next_track'));
    playPause.addEventListener('click', e => this._callService(e, 'media_play_pause'));
  }

  _callService(e, service) {
    e.stopPropagation();
    this._hass.callService('media_player', service, { 'entity_id': this._config.entity });
  }

  _toggle(e) {
    e.stopPropagation();
    this._hass.callService('media_player', 'toggle', {
      entity_id: this._config.entity
    });
  }

  _toggleMute(e) {
    e.stopPropagation();
    this._hass.callService('media_player', 'volume_mute', {
      entity_id: this._config.entity,
      is_volume_muted: !this._attributes.is_volume_muted
    });
  }

  _handleVolumeChange(e) {
    e.stopPropagation();
    var volPercentage = parseFloat(e.target.value);
    var vol = volPercentage > 0 ? volPercentage / 100 : 0;
    this._hass.callService('media_player', 'volume_set', {
      entity_id: this._config.entity,
      volume_level: vol
    });
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

  _renderStyle() {
    const css = document.createElement('style');
    css.textContent = `
      #content {
        padding: 16px;
      }
      #content[group] {
        padding: 0;
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
      .info {
        margin-left: 56px;
      }
      .artwork {
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
      .playername, .status {
        line-height: 40px;
      }
      .playername[has-info] {
        line-height: 20px;
      }
      .mediainfo {
        color: var(--secondary-text-color);
      }
      .mediacontrols {
        margin-left: 56px;
      }
    `;
    return css;
  }

  getCardSize() {
    return 1;
  }
}

customElements.define('mini-media-player', MiniMediaPlayer);
