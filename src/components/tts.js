import { LitElement, html, css } from 'lit-element';

import t from '../utils/translation';

class MiniMediaPlayerTts extends LitElement {
  static get properties() {
    return {
      hass: {},
      config: {},
      player: {},
    };
  }

  get label() {
    return t(
      this.hass,
      'placeholder.tts',
      'ui.card.media_player.text_to_speak',
      'Say',
    );
  }

  get input() {
    return this.shadowRoot.getElementById('tts-input');
  }

  get message() {
    return this.input.value;
  }

  render() {
    return html`
      <ha-textfield
        id="tts-input"
        class="mmp-tts__input"
        placeholder="${this.label}..."
        @click=${e => e.stopPropagation()}
      >
      </ha-textfield>
      <mmp-button class="mmp-tts__button" @click=${this.handleTts}>
        <span>${t(this.hass, 'label.send')}</span>
      </mmp-button>
    `;
  }

  handleTts(e) {
    const { config, message } = this;
    const opts = {
      message,
      entity_id: config.entity_id || this.player.id,
      ...(config.entity_id === 'group' && { entity_id: this.player.group }),
      ...config.data,
    };
    if (config.language) opts.language = config.language;
    switch (config.platform) {
      case 'alexa':
        this.hass.callService('notify', 'alexa_media', {
          message,
          data: { type: config.type || 'tts', ...config.data },
          target: opts.entity_id,
        });
        break;
      case 'sonos':
        this.hass.callService('script', 'sonos_say', {
          sonos_entity: opts.entity_id,
          volume: config.volume || 0.5,
          message,
          ...config.data,
        });
        break;
      case 'webos':
        this.hass.callService('notify', opts.entity_id.split('.').slice(-1)[0], {
          message,
          ...config.data,
        });
        break;
      case 'ga':
        this.hass.callService('notify', 'ga_broadcast', {
          message,
          ...config.data,
        });
        break;
      case 'service': {
        const [domain, service] = (config.data.service || '').split('.');
        const field = config.data.message_field || 'message';
        const serviceData = {
          [field]: message,
          entity_id: opts.entity_id,
          ...(config.language ? { language: opts.language } : {}),
          ...(config.data.service_data || {}),
        };
        this.hass.callService(domain, service, serviceData);
        break;
      }
      default:
        this.hass.callService('tts', `${config.platform}_say`, opts);
    }
    e.stopPropagation();
    this.reset();
  }

  reset() {
    this.input.value = '';
  }

  static get styles() {
    return css`
      :host {
        align-items: center;
        margin: 8px 4px 0px;
        display: flex;
      }
      .mmp-tts__input {
        cursor: text;
        flex: 1;
        margin-right: 8px;
      }
      ha-card[rtl] .mmp-tts__input {
        margin-right: auto;
        margin-left: 8px;
      }
      .mmp-tts__button {
        margin: 0;
        height: 30px;
        padding: 0 .4em;
      }
    `;
  }
}

customElements.define('mmp-tts', MiniMediaPlayerTts);
