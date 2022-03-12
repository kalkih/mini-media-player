import {
  Connection,
  Context,
  HassConfig,
  HassEntities,
  HassEntityAttributeBase,
  HassEntityBase,
  HassServices,
  HassServiceTarget,
  MessageBase,
} from 'home-assistant-js-websocket';

export interface HomeAssistant {
  // eslint-disable-next-line  @typescript-eslint/no-explicit-any
  hassUrl(picture: any);
  connection: Connection;
  connected: boolean;
  states: HassEntities;
  services: HassServices;
  config: HassConfig;
  panelUrl: string;
  // i18n
  // current effective language in that order:
  //   - backend saved user selected language
  //   - language in local app storage
  //   - browser language
  //   - english (en)
  language: string;
  // local stored language, keep that name for backward compatibility
  selectedLanguage: string | null;
  vibrate: boolean;
  resources: Resources;
  callService(
    domain: ServiceCallRequest['domain'],
    service: ServiceCallRequest['service'],
    serviceData?: ServiceCallRequest['serviceData'],
    target?: ServiceCallRequest['target'],
  ): Promise<ServiceCallResponse>;
  callApi<T>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    path: string,
    // eslint-disable-next-line  @typescript-eslint/no-explicit-any
    parameters?: Record<string, any>,
    headers?: Record<string, string>,
  ): Promise<T>;
  // eslint-disable-next-line  @typescript-eslint/no-explicit-any
  fetchWithAuth(path: string, init?: Record<string, any>): Promise<Response>;
  sendWS(msg: MessageBase): void;
  callWS<T>(msg: MessageBase): Promise<T>;
}

export interface ServiceCallRequest {
  domain: string;
  service: string;
  // eslint-disable-next-line  @typescript-eslint/no-explicit-any
  serviceData?: Record<string, any>;
  target?: HassServiceTarget;
}

export interface ServiceCallResponse {
  context: Context;
}

export interface Resources {
  [language: string]: Record<string, string>;
}

interface MiniMediaPlayerSpeakerGroupEntity {
  entity_id: string;
  name: string;
  volume_offset?: number;
}

export interface MiniMediaPlayerConfiguration {
  speaker_group: {
    platform: string;
    show_group_count: boolean;
    supports_master: boolean;
    sync_volume?: boolean;
    entities?: MiniMediaPlayerSpeakerGroupEntity[];
  };
  artwork: string;
  hide: MiniMediaPlayerHideConfiguration;
  toggle_power: boolean;
  volume_step?: number;
  entity: string;
  info: 'default' | 'short' | 'scroll';
  group: boolean;
  volume_stateless: boolean;
  more_info: boolean;
  source: 'default' | 'icon' | 'full';
  sound_mode: 'default' | 'icon' | 'full';
  tap_action: {
    action: string;
  };
  jump_amount: number;
  shortcuts: {
    label: string;
  };
  idle_view?: {
    when_idle?: boolean;
    when_paused?: boolean;
    when_standby?: boolean;
    after?: number;
  };
}

interface MiniMediaPlayerHideConfiguration {
  repeat: boolean;
  shuffle: boolean;
  power_state: boolean;
  artwork_border: boolean;
  icon_state: boolean;
  sound_mode: boolean;
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
}

export enum MediaPlayerEntityState {
  PLAYING = 'playing',
  PAUSED = 'paused',
  IDLE = 'idle',
  OFF = 'off',
  ON = 'on',
  UNAVAILABLE = 'unavailable',
  UNKNOWN = 'unknown',
  STANDBY = 'standby',
}

export interface MediaPlayerEntity extends HassEntityBase {
  attributes: MediaPlayerEntityAttributes;
  state: MediaPlayerEntityState;
}

export interface MediaPlayerEntityAttributes extends HassEntityAttributeBase {
  media_content_id?: string;
  media_content_type?: string;
  media_artist?: string;
  media_playlist?: string;
  media_series_title?: string;
  // eslint-disable-next-line  @typescript-eslint/no-explicit-any
  media_season?: any;
  // eslint-disable-next-line  @typescript-eslint/no-explicit-any
  media_episode?: any;
  app_name?: string;
  media_position_updated_at?: string | number | Date;
  media_duration?: number;
  media_position?: number;
  media_title?: string;
  icon?: string;
  entity_picture_local?: string;
  is_volume_muted?: boolean;
  volume_level?: number;
  source?: string;
  source_list?: string[];
  sound_mode?: string;
  sound_mode_list?: string[];
  // TODO: type this;
  repeat?: string;
  shuffle?: boolean;
  group_members?: string[];
  sync_group?: string[];
}
