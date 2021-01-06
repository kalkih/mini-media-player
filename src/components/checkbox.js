import { LitElement, html, css } from 'lit-element';

class MiniMediaPlayerCheckbox extends LitElement {
  static get properties() {
    return {
      checked: Boolean,
      disabled: Boolean,
      label: String,
    };
  }

  render() {
    return html`
      <ha-switch 
        .checked=${this.checked}
        ?disabled=${this.disabled}>
      </ha-switch>
      <span ?disabled=${this.disabled}>
        <slot>
          ${this.label}
        </slot>
      </span>
    `;
  }

  static get styles() {
    return css`
      :host {
        display: flex;
        padding: .6em 0;
        align-items: center;
      }
      span {
        margin-left: 1em;
        font-weight: 400;
      }
      span[disabled] {
        opacity: .65;
      }
    `;
  }
}

customElements.define('mmp-checkbox', MiniMediaPlayerCheckbox);
