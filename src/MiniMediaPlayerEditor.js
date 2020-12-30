import { LitElement, html } from 'lit-element';
import style from './styles/main.js';
import defaultConfig from './utils/config.js';

const fireEvent = (node, type, detail = {}, options = {}) => {
  const event = new Event(type, {
    bubbles: options.bubbles === undefined ? true : options.bubbles,
    cancelable: Boolean(options.cancelable),
    composed: options.composed === undefined ? true : options.composed,
  });

  event.detail = detail;
  node.dispatchEvent(event);
  return event;
};

const OptionsArtwork = ['cover', 'full-cover', 'material', 'cover-fit', 'none'];

const OptionsSource = ['icon', 'full'];

const OptionsSoundMode = ['icon', 'full'];

const OptionsInfo = ['short', 'scroll'];

const OptionsReplaceMute = ['play_pause', 'stop', 'play_stop', 'next'];

export default class MiniMediaPlayerEditor extends LitElement {
  static get styles() {
    return style;
  }

  static get properties() {
    return { hass: {}, _config: {} };
  }

  setConfig(config) {
    this._config = { ...defaultConfig, ...config };
  }

  get getMediaPlayerEntities() {
    return Object.keys(this.hass.states).filter(
      eid => eid.substr(0, eid.indexOf('.')) === 'media_player'
    );
  }

  get _group() {
    return this._config.group || false;
  }

  // eslint-disable-next-line camelcase
  get _volume_stateless() {
    return this._config.volume_stateless || false;
  }

  // eslint-disable-next-line camelcase
  get _toggle_power() {
    return this._config.toggle_power || true;
  }

  render() {
    if (!this.hass) return html``;

    return html`
      <div class="card-config">
        <div class="overall-config">
          <paper-dropdown-menu
            label="Entity (required)"
            .configValue="${'entity'}"
            @value-changed=${this.valueChanged}
          >
            <paper-listbox
              slot="dropdown-content"
              .selected="${this.getMediaPlayerEntities.indexOf(
                this._config.entity
              )}"
            >
              ${this.getMediaPlayerEntities.map(
                entity => html`<paper-item>${entity}</paper-item>`
              )}
            </paper-listbox>
          </paper-dropdown-menu>

          <div class="side-by-side">
            <paper-input
              label="Name"
              .value="${this._config.name}"
              configValue="name"
              @value-changed=${this.valueChanged}
            ></paper-input>

            <paper-input
              label="Icon"
              .value="${this._config.icon}"
              configValue="icon"
              @value-changed=${this.valueChanged}
            ></paper-input>
          </div>

          <div class="side-by-side">
            <ha-formfield label="Group cards">
              <ha-switch
                .checked=${this._group}
                .configValue="${'group'}"
                @change=${this.valueChanged}
              ></ha-switch>
            </ha-formfield>

            <ha-formfield label="Swap volume slider for buttons">
              <ha-switch
                .checked="${this._volume_stateless}"
                .configValue="${'volume_stateless'}"
                @change=${this.valueChanged}
              ></ha-switch>
            </ha-formfield>

            <ha-formfield label="Toggle power button behavior">
              <ha-switch
                .checked="${this._toggle_power}"
                .configValue="${'toggle_power'}"
                @change=${this.valueChanged}
              ></ha-switch>
            </ha-formfield>
          </div>

          <div class="side-by-side">
            <paper-dropdown-menu
              label="Artwork"
              .configValue=${'artwork'}
              @value-changed=${this.valueChanged}
              class="dropdown"
            >
              <paper-listbox
                slot="dropdown-content"
                .selected=${Object.values(OptionsArtwork).indexOf(
                  this._config.artwork
                )}
              >
                ${Object.values(OptionsArtwork).map(
                  item => html` <paper-item>${item}</paper-item> `
                )}
              </paper-listbox>
            </paper-dropdown-menu>

            <paper-dropdown-menu
              label="Source"
              .configValue=${'source'}
              @value-changed=${this.valueChanged}
              class="dropdown"
            >
              <paper-listbox
                slot="dropdown-content"
                .selected=${Object.values(OptionsSource).indexOf(
                  this._config.source
                )}
              >
                ${Object.values(OptionsSource).map(
                  item => html` <paper-item>${item}</paper-item> `
                )}
              </paper-listbox>
            </paper-dropdown-menu>

            <paper-dropdown-menu
              label="Sound Mode"
              .configValue=${'sound_mode'}
              @value-changed=${this.valueChanged}
              class="dropdown"
            >
              <paper-listbox
                slot="dropdown-content"
                .selected=${Object.values(OptionsSoundMode).indexOf(
                  this._config.sound_mode
                )}
              >
                ${Object.values(OptionsSoundMode).map(
                  item => html` <paper-item>${item}</paper-item> `
                )}
              </paper-listbox>
            </paper-dropdown-menu>
          </div>

          <div class="side-by-side">
            <paper-dropdown-menu
              label="Info"
              .configValue=${'info'}
              @value-changed=${this.valueChanged}
              class="dropdown"
            >
              <paper-listbox
                slot="dropdown-content"
                .selected=${Object.values(OptionsInfo).indexOf(
                  this._config.info
                )}
              >
                ${Object.values(OptionsInfo).map(
                  item => html` <paper-item>${item}</paper-item> `
                )}
              </paper-listbox>
            </paper-dropdown-menu>

            <paper-dropdown-menu
              label="Replace Mute"
              .configValue=${'replace_mute'}
              @value-changed=${this.valueChanged}
              class="dropdown"
            >
              <paper-listbox
                slot="dropdown-content"
                .selected=${Object.values(OptionsReplaceMute).indexOf(
                  this._config.replace_mute
                )}
              >
                ${Object.values(OptionsReplaceMute).map(
                  item => html` <paper-item>${item}</paper-item> `
                )}
              </paper-listbox>
            </paper-dropdown-menu>
          </div>

          <div class="side-by-side">
            <paper-input
              label="Volume Step (1-100)"
              .value="${this._config.volume_step}"
              .configValue="${'volume_step'}"
              @value-changed=${this.valueChanged}
            ></paper-input>

            <paper-input
              label="Max Volume (1-100)"
              .value="${this._config.max_volume}"
              .configValue="${'max_volume'}"
              @value-changed=${this.valueChanged}
            ></paper-input>

            <paper-input
              label="Min Volume (1-100)"
              .value="${this._config.min_volume}"
              .configValue="${'min_volume'}"
              @value-changed=${this.valueChanged}
            ></paper-input>
          </div>

          <div class="side-by-side">
            <paper-input
              label="Idle View"
              .value="${this._config.idle_view}"
              .configValue="${'idle_view'}"
              @value-changed=${this.valueChanged}
            ></paper-input>

            <paper-input
              label="Background"
              .value="${this._config.background}"
              .configValue="${'background'}"
              @value-changed=${this.valueChanged}
            ></paper-input>

            <paper-input
              label="Scale"
              .value="${this._config.scale}"
              .configValue="${'scale'}"
              @value-changed=${this.valueChanged}
            ></paper-input>
          </div>

          <div>
            Settings for Tap actions, TTS, hiding UI elements, idle view,
            speaker groups and shortcuts can only be configured in the code
            editor
          </div>
        </div>
      </div>
    `;
  }

  valueChanged(ev) {
    if (!this._config || !this.hass) {
      return;
    }
    const { target } = ev;
    if (this[`_${target.configValue}`] === target.value) {
      return;
    }
    if (target.configValue) {
      if (target.value === '') {
        delete this._config[target.configValue];
      } else {
        this._config = {
          ...this._config,
          [target.configValue]:
            target.checked !== undefined ? target.checked : target.value,
        };
      }
    }
    fireEvent(this, 'config-changed', { config: this._config });
  }
}
