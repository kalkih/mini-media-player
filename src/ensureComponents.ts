if (!customElements.get('ha-slider')) {
  customElements.define('ha-slider', class extends (customElements.get('paper-slider') as CustomElementConstructor) {});
}

if (!customElements.get('ha-icon-button')) {
  customElements.define(
    'ha-icon-button',
    class extends (customElements.get('paper-icon-button') as CustomElementConstructor) {},
  );
}

if (!customElements.get('ha-icon')) {
  customElements.define('ha-icon', class extends (customElements.get('iron-icon') as CustomElementConstructor) {});
}
