import { LitElement, html, css } from 'lit-element';
import { CheckboxBase } from '@material/mwc-checkbox/mwc-checkbox-base';
import { styles } from '@material/mwc-checkbox/mwc-checkbox.css';

customElements.define('mmp-checkbox-base',
  class MiniMediaPlayerCheckboxBase extends CheckboxBase {
    static get styles() {
      return styles;
    }
  });

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
      <mmp-checkbox-base
        .checked=${this.checked}
        ?disabled=${this.disabled}>
      </mmp-checkbox-base>
      <span class='text' ?disabled=${this.disabled}>
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
        align-items: center;

        --mdc-theme-secondary: var(--mmp-accent-color);
        --mdc-checkbox-unchecked-color: var(--mmp-base-color);
        /* Required for unchecked focus ripple */
        --mdc-theme-on-surface: var(--mmp-base-color);
        --mdc-checkbox-disabled-color: var(--disabled-text-color);
        --mdc-checkbox-ink-color: var(--mmp-base-color);
      }
      mmp-checkbox-base {
        height: calc(48px / 2);
        width: calc(48px / 2);
        margin-top: calc(-48px / 4);
        margin-left: calc(-48px / 4);
      }
      .text {
        display: block;
        margin-left: 1.6em;
        font-weight: 400;
        padding: calc(48px / 4) 0;
        margin-top: 10px;
      }
      .text[disabled] {
        opacity: .65;
      }
    `;
  }
}

window.customElements.define('mmp-checkbox', MiniMediaPlayerCheckbox);
