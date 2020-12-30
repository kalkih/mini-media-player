/* eslint-disable max-classes-per-file */
if (!customElements.get('ha-slider')) {
  if (customElements.get('paper-slider'))
    customElements.define(
      'ha-slider',
      class extends customElements.get('paper-slider') {}
    );
}

if (!customElements.get('ha-icon-button')) {
  if (customElements.get('paper-icon-button'))
    customElements.define(
      'ha-icon-button',
      class extends customElements.get('paper-icon-button') {}
    );
}

if (!customElements.get('ha-icon')) {
  if (customElements.get('iron-icon'))
    customElements.define(
      'ha-icon',
      class extends customElements.get('iron-icon') {}
    );
}
