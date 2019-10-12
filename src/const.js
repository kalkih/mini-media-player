const DEFAULT_HIDE = {
  shuffle: true,
  power_state: true,
  artwork_border: true,
  icon_state: true,
  sound_mode: true,
  runtime: true,
  volume: false,
  controls: false,
  play_pause: false,
  play_stop: true,
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
  STOP: {
    true: 'mdi:stop',
    false: 'mdi:play',
  },
  VOL_DOWN: 'mdi:volume-minus',
  VOL_UP: 'mdi:volume-plus',
};
const UPDATE_PROPS = ['entity', '_overflow',
  'break', 'thumbnail', 'edit', 'idle'];

const PROGRESS_PROPS = ['media_duration', 'media_position', 'media_position_updated_at'];

const BREAKPOINT = 390;

const LABEL_SHORTCUT = 'Shortcuts...';

const MEDIA_INFO = [
  { attr: 'media_title' },
  { attr: 'media_artist' },
  { attr: 'media_series_title' },
  { attr: 'media_season', prefix: 'S' },
  { attr: 'media_episode', prefix: 'E' },
  { attr: 'app_name' },
];


export {
  DEFAULT_HIDE,
  ICON,
  UPDATE_PROPS,
  PROGRESS_PROPS,
  BREAKPOINT,
  LABEL_SHORTCUT,
  MEDIA_INFO,
};
