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
    return t(this.hass, 'placeholder.tts', 'ui.card.media_player.text_to_speak', 'Say');
  }

  get input() {
    return this.shadowRoot.getElementById('tts-input');
  }

  get message() {
    return this.input.value;
  }

  render() {
    return html`
      <paper-input id="tts-input" class='mmp-tts__input'
        no-label-float
        placeholder=${this.label}...
        @click=${e => e.stopPropagation()}>
      </paper-input>
      <mmp-button class='mmp-tts__button' @click=${this.handleTts}>
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
    };
    if (config.language) opts.language = config.language;
    if (config.platform === 'alexa')
      this.hass.callService('notify', 'alexa_media', {
        message,
        data: { type: config.type || 'tts' },
        target: opts.entity_id,
      });
    else if (config.platform === 'sonos')
      this.hass.callService('script', 'sonos_say', {
        sonos_entity: opts.entity_id,
        volume: config.volume || 0.5,
        message,
      });
    else if (config.platform === 'webos')
      this.hass.callService('notify', opts.entity_id.split('.').slice(-1)[0], { message });
    else if (config.platform === 'ga')
      this.hass.callService('notify', 'ga_broadcast', { message });
    else
      this.hass.callService('tts', `${config.platform}_say`, opts);
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
        margin-left: 8px;
        display: flex;
      }
      .mmp-tts__input {
        cursor: text;
        flex: 1;
        margin-right: 8px;
        --paper-input-container-input: {
          font-size: 1em;
        };
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
      paper-input {
        opacity: .75;
        --paper-input-container-color: var(--mmp-text-color);
        --paper-input-container-input-color: var(--mmp-text-color);
        --paper-input-container-focus-color: var(--mmp-text-color);
        --paper-input-container: {
          padding: 0;
        };
      }
      paper-input[focused] {
        opacity: 1;
      }

      ha-card[artwork*='cover'][has-artwork] paper-input {
        --paper-input-container-color: #FFFFFF;
        --paper-input-container-input-color: #FFFFFF;
        --paper-input-container-focus-color: #FFFFFF;
      }
    `;
  }
}

customElements.define('mmp-tts', MiniMediaPlayerTts);
