import { LitElement, html, css, property, CSSResult, customElement } from 'lit-element';
import { MiniMediaPlayerSpeakerGroupEntry } from '../config/types';
import { HomeAssistant } from '../types';

import t from '../utils/translation';

import './checkbox';

export interface GroupChangeEvent extends CustomEvent {
  detail: {
    entity: string;
    checked: boolean;
  };
}

@customElement('mmp-group-item')
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class MiniMediaPlayerGroupItem extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant;
  @property({ attribute: false }) public item!: MiniMediaPlayerSpeakerGroupEntry;
  @property({ attribute: false }) public checked!: boolean;
  @property({ attribute: false }) public disabled!: boolean;
  @property({ attribute: false }) public master!: boolean;

  render() {
    return html`
      <mmp-checkbox
        .checked=${this.checked}
        .disabled=${this.disabled}
        @change="${(e: MouseEvent) => e.stopPropagation()}"
        @click="${this.handleClick}"
      >
        ${this.item.name} ${this.master ? html`<span class="master">(${t(this.hass, 'label.master')})</span>` : ''}
      </mmp-checkbox>
    `;
  }

  private handleClick(ev: MouseEvent): void {
    ev.stopPropagation();
    ev.preventDefault();
    if (this.disabled) return;
    this.dispatchEvent(
      new CustomEvent('change', {
        detail: {
          entity: this.item.entity_id,
          checked: !this.checked,
        },
      }),
    );
  }

  static get styles(): CSSResult {
    return css`
      .master {
        font-weight: 500;
      }
    `;
  }
}
