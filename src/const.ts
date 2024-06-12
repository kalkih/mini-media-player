const DEFAULT_HIDE = {
  repeat: true,
  shuffle: true,
  power_state: true,
  artwork_border: true,
  icon_state: true,
  sound_mode: true,
  group_button: false,
  runtime: true,
  runtime_remaining: true,
  volume: false,
  volume_level: true,
  controls: false,
  play_pause: false,
  play_stop: false,
  prev: false,
  next: false,
  jump: true,
  state_label: false,
  progress: false,
  icon: false,
  name: false,
  info: false,
};

const REPEAT_STATE = {
  OFF: 'off',
  ALL: 'all',
  ONE: 'one',
};

const ICON = {
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
  REPEAT: {
    [REPEAT_STATE.OFF]: 'mdi:repeat-off',
    [REPEAT_STATE.ONE]: 'mdi:repeat-once',
    [REPEAT_STATE.ALL]: 'mdi:repeat',
  },
  STOP: {
    true: 'mdi:stop',
    false: 'mdi:play',
  },
  VOL_DOWN: 'mdi:volume-minus',
  VOL_UP: 'mdi:volume-plus',
  FAST_FORWARD: 'mdi:fast-forward',
  REWIND: 'mdi:rewind',
};

const UPDATE_PROPS = [
  'entity',
  'groupMgmtEntity',
  '_overflow',
  'break',
  'thumbnail',
  'prevThumbnail',
  'edit',
  'idle',
  'cardHeight',
  'backgroundColor',
  'foregroundColor',
];

const PROGRESS_PROPS = ['media_duration', 'media_position', 'media_position_updated_at'];

const BREAKPOINT = 390;

const LABEL_SHORTCUT = 'Shortcuts...';

const MEDIA_INFO = [
  { attr: 'media_title' },
  { attr: 'media_artist' },
  { attr: 'media_series_title' },
  { attr: 'media_season', prefix: 'S' },
  { attr: 'media_episode', prefix: 'E' },
  { attr: 'media_channel' },
  { attr: 'app_name' },
];

const PLATFORM = {
  SONOS: 'sonos',
  SQUEEZEBOX: 'squeezebox',
  BLUESOUND: 'bluesound',
  SOUNDTOUCH: 'soundtouch',
  MEDIAPLAYER: 'media_player',
  HEOS: 'heos',
};

const CONTRAST_RATIO = 4.5;

const COLOR_SIMILARITY_THRESHOLD = 150;

export {
  DEFAULT_HIDE,
  ICON,
  UPDATE_PROPS,
  PROGRESS_PROPS,
  BREAKPOINT,
  LABEL_SHORTCUT,
  MEDIA_INFO,
  PLATFORM,
  CONTRAST_RATIO,
  COLOR_SIMILARITY_THRESHOLD,
  REPEAT_STATE,
};
