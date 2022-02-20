import { LitElement, html, css } from 'lit-element';
// import { RippleBase } from '@material/mwc-ripple/mwc-ripple-base';
import { IconButtonBase } from '@material/mwc-icon-button/mwc-icon-button-base';
import { styles } from '@material/mwc-icon-button/mwc-icon-button.css';

customElements.define('mmp-icon-button-base',
  class MiniMediaPlayerIconButtonBase extends IconButtonBase {
    static get styles() {
      return styles;
    }
  });

class MiniMediaPlayerIconButton extends LitElement {
  render() {
    return html`
      <mmp-icon-button-base>
        <slot></slot>
      </mmp-icon-button-base>
    `;
  }

  static get styles() {
    return css`
      mmp-icon-button-base {
        --mdc-theme-on-primary: currentColor;
        --mdc-theme-text-disabled-on-light: var(--disabled-text-color);
      }
    `;
  }
}

window.customElements.define('mmp-icon-button', MiniMediaPlayerIconButton);
