export interface MiniMediaPlayerBaseConfiguration {
  type?: string;
  entity: string;
  name?: string;
  icon?: string;
  icon_image?: string;
  tap_action?: MiniMediaPlayerAction;
  group?: boolean;
  hide?: MiniMediaPlayerHideConfiguration;
  artwork?: 'default' | 'none' | 'cover' | 'full-cover' | 'material' | 'full-material' | 'full-cover-fit' | 'square' | 'square-material';
  tts?: MiniMediaPlayerTTSConfiguration;
  source?: 'default' | 'icon' | 'full';
  sound_mode?: 'default' | 'icon' | 'full';
  info?: 'default' | 'short' | 'scroll';
  volume_stateless?: boolean;
  volume_step?: number;
  max_volume?: number;
  min_volume?: number;
  replace_mute?: 'play_pause' | 'stop' | 'play_stop' | 'next';
  jump_amount?: number;
  toggle_power?: boolean;
  idle_view?: MiniMediaPlayerIdleViewConfiguration;
  background?: string;
  speaker_group?: MiniMediaPlayerSpeakerGroupBase;
  shortcuts?: MiniMediaPlayerShortcuts;
  scale?: number;

  /**
   * @internal Internal configuration options
   */
  collapse: boolean;
  flow: boolean;

  /**
   * @deprecated The method should not be used
   */
  sonos?: MiniMediaPlayerSpeakerGroupBase;
}

export interface MiniMediaPlayerConfiguration extends MiniMediaPlayerBaseConfiguration {
  entity: string;
  artwork: 'default' | 'none' | 'cover' | 'full-cover' | 'material' | 'full-material' | 'full-cover-fit' | 'square' | 'square-material';
  info: 'default' | 'short' | 'scroll';
  group: boolean;
  volume_stateless: boolean;
  more_info: boolean;
  source: 'default' | 'icon' | 'full';
  sound_mode: 'default' | 'icon' | 'full';
  toggle_power: boolean;
  tap_action: MiniMediaPlayerAction;
  jump_amount: number;
  hide: MiniMediaPlayerHideConfiguration;
  speaker_group: MiniMediaPlayerSpeakerGroup;
  shortcuts: MiniMediaPlayerShortcuts;
  max_volume: number;
  min_volume: number;

  collapse: boolean;
  flow: boolean;
}

export interface MiniMediaPlayerShortcuts {
  list?: MiniMediaPlayerShortcutItem[];
  Buttons?: MiniMediaPlayerShortcutItem[];
  hide_when_off?: boolean;
  columns?: 1 | 2 | 3 | 4 | 5 | 6;
  column_height?: number;
  label?: string;
  attribute?: string;
  aling_text?: 'left' | 'right' | 'center';
}

export interface MiniMediaPlayerShortcutItem {
  type: string;
  id: string;
  name?: string;
  icon?: string;
  image?: string;
  cover?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data?: Record<string, any>;
}

export interface MiniMediaPlayerIdleViewConfiguration {
  when_idle?: boolean;
  when_paused?: boolean;
  when_standby?: boolean;
  after?: number;
}

export interface MiniMediaPlayerTTSConfiguration {
  platform: string;
  language?: string;
  entity_id?: string | 'all' | 'group' | string[];
  volume?: number;
  type?: string | 'tts' | 'announce' | 'push';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data?: Record<string, any>;
}

export interface MiniMediaPlayerAction {
  action: MiniMediaPlayerActionEvent;
  entity?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  service?: Record<string, any>;
  service_data?: string;
  navigation_path?: string;
  url?: string;
  new_tab?: boolean;
  haptic?: 'success' | 'warning' | 'failure' | 'light' | 'medium' | 'heavy' | 'selection';
}

export enum MiniMediaPlayerActionEvent {
  MORE_INFO = 'more-info',
  NAVIGATE = 'navigate',
  CALL_SERVICE = 'call-service',
  URL = 'url',
  FIRE_DOM_EVENT = 'fire-dom-event',
  NONE = 'none',
}

export interface MiniMediaPlayerSpeakerGroupBase {
  entities: MiniMediaPlayerSpeakerGroupEntry[];
  platform?: string;
  sync_volume?: boolean;
  expanded?: boolean;
  show_group_count?: boolean;
  icon?: string;
  group_mgmt_entity?: string;
  supports_master?: boolean;
}

export interface MiniMediaPlayerSpeakerGroup extends MiniMediaPlayerSpeakerGroupBase {
  entities: MiniMediaPlayerSpeakerGroupEntry[];
  platform: string;
  show_group_count: boolean;
  supports_master: boolean;
}

export interface MiniMediaPlayerSpeakerGroupEntry {
  entity_id: string;
  name: string;
  volume_offset?: number;
}

interface MiniMediaPlayerHideConfiguration {
  repeat: boolean;
  shuffle: boolean;
  power_state: boolean;
  artwork_border: boolean;
  icon_state: boolean;
  sound_mode: boolean;
  group_button: boolean;
  runtime: boolean;
  runtime_remaining: boolean;
  volume: boolean;
  volume_level: boolean;
  controls: boolean;
  play_pause: boolean;
  play_stop: boolean;
  prev: boolean;
  next: boolean;
  jump: boolean;
  state_label: boolean;
  progress: boolean;
  icon: boolean;
  name: boolean;
  info: boolean;
}
