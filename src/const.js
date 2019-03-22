const DEFAULT_HIDE = {
  shuffle: true,
  power_state: true,
  artwork_border: true,
  icon_state: true,
};
const ICON = {
  DEFAULT: 'mdi:cast',
  DROPDOWN: 'mdi:chevron-down',
  GROUP: 'mdi:speaker-multiple',
  MENU: 'mdi:menu-down',
  MUTE: {
    true: 'mdi:volume-off',
    false: 'mdi:volume-high',
  },
  NEXT: 'mdi:skip-next',
  PLAY: {
    true: 'mdi:pause',
    false: 'mdi:play',
  },
  POWER: 'mdi:power',
  PREV: 'mdi:skip-previous',
  SEND: 'mdi:send',
  SHUFFLE: 'mdi:shuffle',
  STOP: 'mdi:stop',
  VOL_DOWN: 'mdi:volume-minus',
  VOL_UP: 'mdi:volume-plus',
};
const UPDATE_PROPS = ['entity', 'source', '_progress', '_pos', '_overflow',
  'break', 'thumbnail', 'edit', 'idleView'];
const BREAKPOINT = 390;

export {
  DEFAULT_HIDE,
  ICON,
  UPDATE_PROPS,
  BREAKPOINT,
};
