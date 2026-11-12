const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');
const ts = require('typescript');

// Compile the real model and its local TypeScript imports without a browser.
require.extensions['.ts'] = (module, filename) => {
  const source = fs.readFileSync(filename, 'utf8');
  module._compile(ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText, filename);
};
const Model = require('../src/model.ts').default;
const left = 'media_player.lab_left';
const right = 'media_player.lab_right';
const outside = 'media_player.lab_outside';
function setup({ sync = true, step = 2, volume = 0.2, group = [left, right], offsets = [0, 0] } = {}) {
  const calls = [];
  const config = { entity: left, volume_step: step, speaker_group: {
    platform: 'heos', sync_volume: sync,
    entities: [{ entity_id: left, volume_offset: offsets[0] },
      { entity_id: right, volume_offset: offsets[1] }, { entity_id: outside }],
  } };
  const entity = { entity_id: left, state: 'playing', attributes: { group_members: group } };
  if (volume !== null) entity.attributes.volume_level = volume;
  const model = new Model({ callService: (domain, service, data) => calls.push({ domain, service, ...data }) }, config, entity);
  const event = { stopPropagation() {} };
  return { model, calls, event };
}
function levels(calls, expected) {
  assert.deepEqual(calls.map(c => c.entity_id), expected.map(([id]) => id));
  calls.forEach((call, i) => {
    assert.equal(call.domain, 'media_player');
    assert.equal(call.service, 'volume_set');
    assert.ok(Math.abs(call.volume_level - expected[i][1]) < 1e-10, JSON.stringify(call));
  });
}
for (const [method, expected] of [['volumeUp', 0.22], ['volumeDown', 0.18]]) {
  test(`${method} synchronizes configured members of the actual group`, () => {
    const { model, calls, event } = setup({ group: [left, right, 'media_player.unconfigured'] });
    model[method](event);
    levels(calls, [[left, expected], [right, expected]]);
  });
  test(`${method} keeps sync_volume false local`, () => {
    const { model, calls, event } = setup({ sync: false });
    model[method](event); levels(calls, [[left, expected]]);
  });
}
test('offsets are relative to the current player, not added again on every click', () => {
  const { model, calls, event } = setup({ offsets: [10, 20], volume: 0.3 });
  model.volumeUp(event); levels(calls, [[left, 0.32], [right, 0.42]]);
});
for (const [method, volume, offsets, expected] of [
  ['volumeUp', 0.99, [0, 20], [1, 1]],
  ['volumeDown', 0.01, [20, 0], [0, 0]],
]) {
  test(`${method} clamps all group volumes`, () => {
    const { model, calls, event } = setup({ volume, offsets });
    model[method](event); levels(calls, [[left, expected[0]], [right, expected[1]]]);
  });
}
for (const options of [{ step: undefined }, { step: 0 }, { volume: null }]) {
  test(`relative volume services reach the group: ${JSON.stringify(options)}`, () => {
    const { model, calls, event } = setup(options);
    if (Object.hasOwn(options, 'step')) model.config.volume_step = options.step;
    model.volumeUp(event); model.volumeDown(event);
    assert.deepEqual(calls.map(({ service, entity_id }) => [service, entity_id]), [
      ['volume_up', left], ['volume_up', right], ['volume_down', left], ['volume_down', right],
    ]);
    assert.ok(calls.every(c => !Object.hasOwn(c, 'volume_level')));
  });
}
for (const group of [[], [left]]) {
  test(`ungrouped controls still work: ${JSON.stringify(group)}`, () => {
    const { model, calls, event } = setup({ group });
    model.volumeUp(event); levels(calls, [[left, 0.22]]);
  });
}
