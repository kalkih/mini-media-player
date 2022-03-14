import { LitElement, html, css, CSSResult, property, customElement, TemplateResult } from 'lit-element';
import MediaPlayerObject from '../model';

import './dropdown';

interface DropdownItem {
  name: string;
  id: string;
  type: 'source';
}

type ChangeEvent = CustomEvent<DropdownItem>;

@customElement('mmp-source-menu')
export class MiniMediaPlayerSourceMenu extends LitElement {
  @property({ attribute: false }) public player!: MediaPlayerObject;

  @property({ attribute: false }) public icon!: boolean[];

  get source(): string {
    return this.player.source;
  }

  get alternatives(): DropdownItem[] {
    return this.player.sources.map((source) => ({
      name: source,
      id: source,
      type: 'source',
    }));
  }

  render(): TemplateResult {
    return html`
      <mmp-dropdown
        @change=${this.handleSource}
        .items=${this.alternatives}
        .label=${this.source}
        .selected=${this.source}
        .icon=${this.icon}
      ></mmp-dropdown>
    `;
  }

  private handleSource(ev: ChangeEvent) {
    const { id } = ev.detail;
    this.player.setSource(ev, id);
  }

  static get styles(): CSSResult {
    return css`
      :host {
        max-width: 120px;
        min-width: var(--mmp-unit);
      }
      :host([full]) {
        max-width: none;
      }
    `;
  }
}
