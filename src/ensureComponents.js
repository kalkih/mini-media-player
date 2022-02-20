if (!customElements.get('ha-icon') && customElements.get('iron-icon')) {
  window.customElements.define(
    'ha-icon',
    class extends customElements.get('iron-icon') {},
  );
}
