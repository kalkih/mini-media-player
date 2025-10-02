import { LitElement, html, css, customElement, property, CSSResult, TemplateResult } from 'lit-element';

import t from '../utils/translation';

import './groupItem';
import './button';
import { HomeAssistant } from '../types';
import MediaPlayerObject from '../model';
import { MiniMediaPlayerSpeakerGroupEntry } from '../config/types';
import { PLATFORM} from './../const';
import { GroupChangeEvent } from './groupItem';

@customElement('mmp-group-list')
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class MiniMediaPlayerGroupList extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant;
  @property({ attribute: false }) public entities!: MiniMediaPlayerSpeakerGroupEntry[];
  @property({ attribute: false }) public player!: MediaPlayerObject;
  @property({ attribute: false }) public visible!: boolean;

  get group(): string[] {
    return this.player.group;
  }

  get master(): string {
    return this.player.master;
  }

  get isMaster(): boolean {
    return this.player.isMaster;
  }

  get isGrouped(): boolean {
    return this.player.isGrouped;
  }

  private handleGroupChange(ev: GroupChangeEvent): void {
    const { entity, checked } = ev.detail;
    this.player.handleGroupChange(ev, entity, checked);
  }

  render() {
    if (!this.visible) return html``;
    const { group, isMaster, isGrouped } = this;
    const { id } = this.player;
    return html`
      <div class="mmp-group-list">
        <span class="mmp-group-list__title">${t(this.hass, 'title.speaker_management')}</span>
        ${this.entities.map((item) => this.renderItem(item, id))}
        <div class="mmp-group-list__buttons">
          <mmp-button raised ?disabled=${!isGrouped} @click=${(e) => this.player.handleGroupChange(e, id, false)}>
            <span>${t(this.hass, 'label.leave')}</span>
          </mmp-button>
          ${isGrouped && isMaster
            ? html`
                <mmp-button raised @click=${(e) => this.player.handleGroupChange(e, group, false)}>
                  <span>${t(this.hass, 'label.ungroup')}</span>
                </mmp-button>
              `
            : html``}
          <mmp-button
            raised
            ?disabled=${!isMaster}
            @click=${(e) =>
              this.player.handleGroupChange(
                e,
                this.entities.map((item) => item.entity_id),
                true,
              )}
          >
            <span>${t(this.hass, 'label.group_all')}</span>
          </mmp-button>
        </div>
      </div>
    `;
  }

  private renderItem(item: MiniMediaPlayerSpeakerGroupEntry, entityId: string): TemplateResult {
    const itemId = item.entity_id;
    return html` <mmp-group-item
      @change=${this.handleGroupChange}
      .item=${item}
      .hass=${this.hass}
      .checked=${(this.player.config.speaker_group.platform === PLATFORM.OWNTONE && this.hass.states[itemId].state !== "off") || itemId === entityId || this.group.includes(itemId)}
      .disabled=${itemId === entityId || !this.isMaster}
      .master=${itemId === this.master}
    />`;
  }

  static get styles(): CSSResult {
    return css`
      .mmp-group-list {
        display: flex;
        flex-direction: column;
        margin-left: 8px;
        margin-bottom: 8px;
      }
      .mmp-group-list__title {
        font-weight: 500;
        letter-spacing: 0.1em;
        margin: 8px 0 4px;
        text-transform: uppercase;
      }
      .mmp-group-list__buttons {
        display: flex;
      }
      mmp-button {
        margin: 8px 8px 0 0;
        min-width: 0;
        text-transform: uppercase;
        text-align: center;
        width: 50%;
        --mdc-theme-primary: transparent;
      }
    `;
  }
}
