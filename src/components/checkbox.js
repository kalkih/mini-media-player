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
      <label class="mmp-checkbox">
        <input type="checkbox" ?checked=${this.checked} ?disabled=${this.disabled}>
        <slot>
          <span>${this.label}</span>
        </slot>
      </label>
    `;
  }

  static get styles() {
    return css`
      .mmp-checkbox {
        z-index: 0;
        position: relative;
        display: inline-block;
        color: var(--mmp-text-color);
        font-size: 16px;
        line-height: 1.5;
      }
      /* Input */
      .mmp-checkbox > input {
        appearance: none;
        -moz-appearance: none;
        -webkit-appearance: none;
        z-index: -1;
        position: absolute;
        left: -10px;
        top: -8px;
        display: block;
        margin: 0;
        border-radius: 50%;
        width: 40px;
        height: 40px;
        background-color: var(--mmp-text-color);
        box-shadow: none;
        outline: none;
        opacity: 0  ;
        transform: scale(1);
        pointer-events: none;
        transition: opacity 0.3s, transform 0.2s;
      }

      /* Span */
      .mmp-checkbox > span {
        display: inline-block;
        width: 100%;
        cursor: pointer;
      }

      /* Box */
      .mmp-checkbox > span::before {
        content: "";
        display: inline-block;
        box-sizing: border-box;
        margin: 3px 11px 3px 1px;
        border: solid 2px; /* Safari */
        border-color: var(--mmp-text-color);
        border-radius: 2px;
        width: 18px;
        height: 18px;
        vertical-align: top;
        transition: border-color 0.2s, background-color 0.2s;
      }

      /* Checkmark */
      .mmp-checkbox > span::after {
        content: "";
        display: block;
        position: absolute;
        top: 3px;
        left: 1px;
        width: 10px;
        height: 5px;
        border: solid 2px transparent;
        border-right: none;
        border-top: none;
        transform: translate(3px, 4px) rotate(-45deg);
      }

      /* Checked, Indeterminate */
      .mmp-checkbox > input:checked,
      .mmp-checkbox > input:indeterminate {
        background-color: var(--mmp-text-color);
      }

      .mmp-checkbox > input:checked + span::before,
      .mmp-checkbox > input:indeterminate + span::before {
        border-color: var(--mmp-text-color);
        background-color: var(--mmp-text-color);
      }

      .mmp-checkbox > input:checked + span::after,
      .mmp-checkbox > input:indeterminate + span::after {
        border-color: var(--mmp-text-color);
      }

      .mmp-checkbox > input:indeterminate + span::after {
        border-left: none;
        transform: translate(4px, 3px);
      }

      /* Hover, Focus */
      .mmp-checkbox:hover > input {
        opacity: 0.04;
      }

      .mmp-checkbox > input:focus {
        opacity: 0.12;
      }

      .mmp-checkbox:hover > input:focus {
        opacity: 0.16;
      }

      /* Active */
      .mmp-checkbox > input:active {
        opacity: 1;
        transform: scale(0);
        transition: transform 0s, opacity 0s;
      }

      .mmp-checkbox > input:active + span::before {
        border-color: var(--mmp-accent-color);
      }

      .mmp-checkbox > input:checked:active + span::before {
        border-color: transparent;
        background-color: var(--mmp-text-color);
      }

      /* Disabled */
      .mmp-checkbox > input:disabled {
        opacity: 0;
      }

      .mmp-checkbox > input:disabled + span {
        color: var(--mmp-text-color);
        cursor: initial;
      }

      .mmp-checkbox > input:disabled + span::before {
        border-color: currentColor;
      }

      .mmp-checkbox > input:checked:disabled + span::before,
      .mmp-checkbox > input:indeterminate:disabled + span::before {
        border-color: transparent;
        background-color: currentColor;
      }
    `;
  }
}

customElements.define('mmp-checkbox', MiniMediaPlayerCheckbox);
