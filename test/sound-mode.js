// Use the complete production bundle with inert Home Assistant presentation elements.
for (const tag of ['ha-card', 'ha-icon', 'ha-icon-button', 'ha-slider']) {
  customElements.define(tag, class extends HTMLElement {});
}
await import('../dist/mini-media-player-bundle.js');

const results = [];
const calls = [];
const modes = ['Stereo', 'Music', 'Movie'];
function check(name, actual, expected) {
  results.push({
    name,
    actual: structuredClone(actual),
    expected: structuredClone(expected),
    pass: JSON.stringify(actual) === JSON.stringify(expected),
  });
}
function hass(mode, extra = {}) {
  const entity = {
    entity_id: 'media_player.demo',
    state: 'playing',
    attributes: {
      friendly_name: 'Demo receiver',
      sound_mode: mode,
      sound_mode_list: modes,
      source: 'HDMI',
      source_list: ['HDMI', 'Radio'],
      ...extra,
    },
  };
  return {
    states: { [entity.entity_id]: entity },
    language: 'en',
    translationMetadata: { translations: { en: { isRTL: false } } },
    callService: (...args) => {
      calls.push(args);
      return Promise.resolve();
    },
  };
}
async function settle(element) {
  if (element.updateComplete) await element.updateComplete;
  if (element.shadowRoot) {
    for (const child of element.shadowRoot.querySelectorAll('*')) await settle(child);
  }
}
async function update(card, mode, extra) {
  card.hass = hass(mode, extra);
  await settle(card);
}
function dropdown(card, tag = 'mmp-sound-menu') {
  return card.shadowRoot
    .querySelector('mmp-powerstrip')
    .shadowRoot.querySelector(tag)
    .shadowRoot.querySelector('mmp-dropdown');
}
function label(menu) {
  return menu.shadowRoot.querySelector('.mmp-dropdown__label')?.textContent.trim() ?? null;
}
function selected(menu) {
  return menu.shadowRoot.querySelector('.mmp-dropdown__item[selected]')?.textContent.trim() ?? null;
}
async function choose(menu, value) {
  menu.shadowRoot.querySelector('#button').click();
  await settle(menu);
  const item = [...menu.shadowRoot.querySelectorAll('.mmp-dropdown__item')].find(
    (button) => button.textContent.trim() === value,
  );
  item.click();
  await settle(menu.getRootNode().host);
}
const selectCall = (mode) => [
  'media_player',
  'select_sound_mode',
  { entity_id: 'media_player.demo', sound_mode: mode },
];

for (const display of ['full', 'icon']) {
  const prefix = `${display}: `;
  const card = document.createElement('mini-media-player');
  card.setConfig({
    type: 'custom:mini-media-player',
    entity: 'media_player.demo',
    sound_mode: display,
    hide: { sound_mode: false },
  });
  card.hass = hass('Stereo');
  document.body.append(card);
  await settle(card);
  let menu = dropdown(card);
  check(prefix + 'initial selection', selected(menu), 'Stereo');
  if (display === 'full') check(prefix + 'initial label', label(menu), 'Stereo');

  await update(card, 'Music');
  check(prefix + 'external update before interaction', selected(menu), 'Music');
  calls.length = 0;
  await choose(menu, 'Movie');
  check(prefix + 'selection calls the service', calls, [selectCall('Movie')]);
  await update(card, 'Movie');
  check(prefix + 'backend confirms selection', selected(menu), 'Movie');

  await update(card, 'Stereo');
  check(prefix + 'external update after interaction', selected(menu), 'Stereo');
  if (display === 'full') check(prefix + 'label follows external update', label(menu), 'Stereo');
  calls.length = 0;
  await choose(menu, 'Movie');
  check(prefix + 'previously selected mode can be requested again', calls, [selectCall('Movie')]);
  await update(card, 'Stereo');
  check(prefix + 'unaccepted selection follows actual state', selected(menu), 'Stereo');

  await update(card, 'Music', { sound_mode_list: ['Stereo', 'Music'] });
  check(prefix + 'selection follows a changed mode list', selected(menu), 'Music');
  calls.length = 0;
  await choose(menu, 'Music');
  check(prefix + 'current mode does not call the service again', calls, []);

  await update(card, '', { sound_mode_list: ['Stereo', 'Music'] });
  check(prefix + 'empty backend mode clears selection', selected(menu), null);
  if (display === 'full') check(prefix + 'empty backend mode clears label', label(menu), '');

  await update(card, 'Stereo');
  card.remove();
  document.body.append(card);
  await update(card, 'Music');
  menu = dropdown(card);
  check(prefix + 'reattached card follows state', selected(menu), 'Music');

  const source = dropdown(card, 'mmp-source-menu');
  calls.length = 0;
  await choose(source, 'Radio');
  check(prefix + 'source service control', calls, [
    ['media_player', 'select_source', { entity_id: 'media_player.demo', source: 'Radio' }],
  ]);
  await update(card, 'Music', { source: 'Radio' });
  check(prefix + 'source state control', selected(source), 'Radio');
  card.remove();
}
window.testResults = {
  passed: results.filter((result) => result.pass).length,
  failed: results.filter((result) => !result.pass).length,
  results,
};
document.querySelector('#results').textContent = JSON.stringify(window.testResults, null, 2);
