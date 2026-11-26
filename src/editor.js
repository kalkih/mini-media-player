import { LitElement, html, css } from 'lit';
import style from './style';
import generateConfig from './config/config';
import './components/dropdown';
import translation from './utils/translation';

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

const OptionsArtwork = ['cover', 'full-cover', 'full-cover-fit', 'material', 'none'];

const OptionsSource = ['icon', 'full'];

const OptionsSoundMode = ['icon', 'full'];

const OptionsInfo = ['short', 'scroll'];

const OptionsReplaceMute = ['play_pause', 'stop', 'play_stop', 'next'];

const optionName = (hass, option) => option && translation(hass, `editor.option.${option}`, undefined, option);

const computeItems = (hass, options, optional = false) => {
  const items = options.map((option) => ({
    name: optionName(hass, option),
    id: option,
  }));

  if (optional) {
    items.push({ name: translation(hass, 'editor.default', undefined, 'Default'), id: undefined });
  }

  return items;
};

export default class MiniMediaPlayerEditor extends LitElement {
  static get styles() {
    return [
      style,
      css`
        .editor-side-by-side {
          display: flex;
          margin: 16px 0;
        }
        .editor-side-by-side > * {
          flex: 1;
          padding-right: 4px;
        }
        .editor-label {
          margin-left: 6px;
          font-size: 0.8em;
          opacity: 0.75;
        }
      `,
    ];
  }

  static get properties() {
    return { hass: {}, _config: {} };
  }

  setConfig(config) {
    this._config = Object.assign({}, generateConfig, config);
  }

  get getMediaPlayerEntities() {
    return Object.keys(this.hass.states).filter((eid) => eid.substr(0, eid.indexOf('.')) === 'media_player');
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
    return this._config.toggle_power ?? true;
  }

  localize(key) {
    return translation(this.hass, `editor.${key}`);
  }

  render() {
    if (!this.hass) return html``;

    const mediaPlayerOptions = this.getMediaPlayerEntities.map((entity) => ({
      name: entity,
      id: entity,
    }));

    return html`
      <div class="card-config">
        <div class="overall-config">
          <span class="editor-label">${this.localize('entity')}</span>
          <mmp-dropdown
            class="mmp-shortcuts__dropdown"
            @change=${({ detail }) => this.valueChanged({ target: { configValue: 'entity', value: detail.id } })}
            .items=${mediaPlayerOptions}
            .label=${this.localize('select_entity')}
            .selected=${this._config.entity}
          >
          </mmp-dropdown>

          <div class="editor-side-by-side">
            <paper-input
              label="${this.localize('name')}"
              .value="${this._config.name}"
              .configValue="${'name'}"
              @value-changed=${this.valueChanged}
            ></paper-input>

            <paper-input
              label="${this.localize('icon')}"
              .value="${this._config.icon}"
              .configValue="${'icon'}"
              @value-changed=${this.valueChanged}
            ></paper-input>

            <paper-input
              label="${this.localize('icon_image')}"
              .value="${this._config.icon_image}"
              .configValue="${'icon_image'}"
              @value-changed=${this.valueChanged}
            ></paper-input>
          </div>

          <div class="editor-side-by-side">
            <ha-formfield label="${this.localize('group_cards')}">
              <ha-switch .checked=${this._group} .configValue="${'group'}" @change=${this.valueChanged}></ha-switch>
            </ha-formfield>

            <ha-formfield label="${this.localize('volume_stateless')}">
              <ha-switch
                .checked="${this._volume_stateless}"
                .configValue="${'volume_stateless'}"
                @change=${this.valueChanged}
              ></ha-switch>
            </ha-formfield>

            <ha-formfield label="${this.localize('toggle_power')}">
              <ha-switch
                .checked="${this._toggle_power}"
                .configValue="${'toggle_power'}"
                @change=${this.valueChanged}
              ></ha-switch>
            </ha-formfield>
          </div>

          <div class="editor-side-by-side">
            <div>
              <span class="editor-label">${this.localize('artwork')}</span>
              <mmp-dropdown
                class="mmp-shortcuts__dropdown"
                @change=${({ detail }) => this.valueChanged({ target: { configValue: 'artwork', value: detail.id } })}
                .items=${computeItems(this.hass, OptionsArtwork, true)}
                .label=${this.localize('default')}
                .selected=${this._config.artwork}
                .selectedLabel=${optionName(this.hass, this._config.artwork)}
              >
              </mmp-dropdown>
            </div>
            <div>
              <span class="editor-label">${this.localize('source')}</span>
              <mmp-dropdown
                class="mmp-shortcuts__dropdown"
                @change=${({ detail }) => this.valueChanged({ target: { configValue: 'source', value: detail.id } })}
                .items=${computeItems(this.hass, OptionsSource, true)}
                .label=${this.localize('default')}
                .selected=${this._config.source}
                .selectedLabel=${optionName(this.hass, this._config.source)}
              >
              </mmp-dropdown>
            </div>
            <div>
              <span class="editor-label">${this.localize('sound_mode')}</span>
              <mmp-dropdown
                class="mmp-shortcuts__dropdown"
                @change=${({ detail }) =>
        this.valueChanged({ target: { configValue: 'sound_mode', value: detail.id } })}
                .items=${computeItems(this.hass, OptionsSoundMode, true)}
                .label=${this.localize('default')}
                .selected=${this._config.sound_mode}
                .selectedLabel=${optionName(this.hass, this._config.sound_mode)}
              >
              </mmp-dropdown>
            </div>
          </div>

          <div class="editor-side-by-side">
            <div>
              <span class="editor-label">${this.localize('info')}</span>
              <mmp-dropdown
                class="mmp-shortcuts__dropdown"
                @change=${({ detail }) => this.valueChanged({ target: { configValue: 'info', value: detail.id } })}
                .items=${computeItems(this.hass, OptionsInfo, true)}
                .label=${this.localize('default')}
                .selected=${this._config.info}
                .selectedLabel=${optionName(this.hass, this._config.info)}
              >
              </mmp-dropdown>
            </div>

            <div>
              <span class="editor-label">${this.localize('replace_mute')}</span>
              <mmp-dropdown
                class="mmp-shortcuts__dropdown"
                @change=${({ detail }) =>
        this.valueChanged({ target: { configValue: 'replace_mute', value: detail.id } })}
                .items=${computeItems(this.hass, OptionsReplaceMute, true)}
                .label=${this.localize('default')}
                .selected=${this._config.replace_mute}
                .selectedLabel=${optionName(this.hass, this._config.replace_mute)}
              >
              </mmp-dropdown>
            </div>
          </div>

          <div class="editor-side-by-side">
            <paper-input
              label="${this.localize('volume_step')}"
              .value="${this._config.volume_step}"
              .configValue="${'volume_step'}"
              @value-changed=${this.valueChanged}
            ></paper-input>

            <paper-input
              label="${this.localize('max_volume')}"
              .value="${this._config.max_volume}"
              .configValue="${'max_volume'}"
              @value-changed=${this.valueChanged}
            ></paper-input>

            <paper-input
              label="${this.localize('min_volume')}"
              .value="${this._config.min_volume}"
              .configValue="${'min_volume'}"
              @value-changed=${this.valueChanged}
            ></paper-input>
          </div>

          <div class="editor-side-by-side">
            <paper-input
              label="${this.localize('background')}"
              .value="${this._config.background}"
              .configValue="${'background'}"
              @value-changed=${this.valueChanged}
            ></paper-input>

            <paper-input
              label="${this.localize('scale')}"
              .value="${this._config.scale}"
              .configValue="${'scale'}"
              @value-changed=${this.valueChanged}
            ></paper-input>
          </div>

          <div>
            ${this.localize('code_editor_notice')}
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
          [target.configValue]: target.checked !== undefined ? target.checked : target.value,
        };
      }
    }
    fireEvent(this, 'config-changed', { config: this._config });
  }
}

customElements.define('mini-media-player-editor', MiniMediaPlayerEditor);
