import { MiniMediaPlayerConfiguration } from './config/types';
import { PROGRESS_PROPS, MEDIA_INFO, PLATFORM, REPEAT_STATE } from './const';
import { HomeAssistant, MediaPlayerEntity, MediaPlayerEntityAttributes, MediaPlayerEntityState } from './types';
import arrayBufferToBase64 from './utils/misc';

export interface MediaPlayerMedia {
  media_content_type: string;
  media_content_id: string;
}

export default class MediaPlayerObject {
  hass: HomeAssistant;
  config: MiniMediaPlayerConfiguration;
  entity: MediaPlayerEntity;

  state: MediaPlayerEntityState;
  idle: boolean;

  _entityId: string;
  _attr: MediaPlayerEntityAttributes;
  _active: boolean;

  constructor(hass: HomeAssistant, config: MiniMediaPlayerConfiguration, entity: MediaPlayerEntity) {
    this.hass = hass || {};
    this.config = config || {};
    this.entity = entity || {};
    this.state = entity.state;
    this._entityId = (entity && entity.entity_id) || this.config.entity;
    this._attr = entity.attributes || {};
    this.idle = config.idle_view ? this.idleView : false;
    this._active = this.isActive;
  }

  get id(): string {
    return this.entity.entity_id;
  }

  get icon(): string | undefined {
    return this._attr.icon;
  }

  get isPaused(): boolean {
    return this.state === MediaPlayerEntityState.PAUSED;
  }

  get isPlaying(): boolean {
    return this.state === MediaPlayerEntityState.PLAYING;
  }

  get isIdle(): boolean {
    return this.state === MediaPlayerEntityState.IDLE;
  }

  get isStandby(): boolean {
    return this.state === MediaPlayerEntityState.STANDBY;
  }

  get isUnavailable(): boolean {
    return this.state === MediaPlayerEntityState.UNAVAILABLE;
  }

  get isOff(): boolean {
    return this.state === MediaPlayerEntityState.OFF;
  }

  get isActive(): boolean {
    return (!this.isOff && !this.isUnavailable && !this.idle) || false;
  }

  get assumedState(): boolean {
    return this._attr.assumed_state || false;
  }

  get shuffle(): boolean {
    return this._attr.shuffle || false;
  }

  get repeat(): string {
    return this._attr.repeat || REPEAT_STATE.OFF;
  }

  get content(): string {
    return this._attr.media_content_type || 'none';
  }

  get mediaDuration(): string | number | Date {
    return this._attr.media_duration || 0;
  }

  get updatedAt(): string | number | Date {
    return this._attr.media_position_updated_at || 0;
  }

  get position(): number {
    return this._attr.media_position || 0;
  }

  get name(): string {
    return this._attr.friendly_name || '';
  }

  get groupCount(): number {
    return this.group.length;
  }

  get isGrouped(): boolean {
    return this.group.length > 1;
  }

  get group(): string[] {
    if (this.platform === PLATFORM.SQUEEZEBOX) {
      return this._attr.sync_group || [];
    }
    if (this.platform === PLATFORM.MEDIAPLAYER || this.platform === PLATFORM.HEOS
      || this.platform === PLATFORM.SONOS) {
      return this._attr.group_members || [];
    }
    return (this._attr[`${this.platform}_group`] || []) as string[];
  }

  get platform(): string {
    return this.config.speaker_group.platform;
  }

  get master(): string {
    return this.supportsMaster ? this.group[0] || this._entityId : this._entityId;
  }

  get isMaster(): boolean {
    return this.master === this._entityId;
  }

  get sources(): string[] {
    return this._attr.source_list || [];
  }

  get source(): string {
    return this._attr.source || '';
  }

  get soundModes(): string[] {
    return this._attr.sound_mode_list || [];
  }

  get soundMode(): string {
    return this._attr.sound_mode || '';
  }

  get muted(): boolean {
    return this._attr.is_volume_muted || false;
  }

  get vol(): number {
    return this._attr.volume_level || 0;
  }

  get picture(): string | undefined {
    return this._attr.entity_picture_local || this._attr.entity_picture;
  }

  get hasArtwork(): boolean {
    return !!this.picture && this.config.artwork !== 'none' && this._active && !this.idle;
  }

  get mediaInfo(): {
    text: string;
    prefix: string;
    attr: string;
  }[] {
    return MEDIA_INFO.map((item) => ({
      text: this._attr[item.attr],
      prefix: '',
      ...item,
    })).filter((item) => item.text);
  }

  get hasProgress(): boolean {
    return !this.config.hide.progress && !this.idle && PROGRESS_PROPS.every((prop) => prop in this._attr);
  }

  get supportsPrev(): boolean {
    return !!this._attr.supported_features && (this._attr.supported_features | 16) === this._attr.supported_features;
  }

  get supportsNext(): boolean {
    return !!this._attr.supported_features && (this._attr.supported_features | 32) === this._attr.supported_features;
  }

  get supportsPause(): boolean {
    return !!this._attr.supported_features && (this._attr.supported_features | 1) === this._attr.supported_features;
  }

  get supportsPlay(): boolean {
    return !!this._attr.supported_features && (this._attr.supported_features | 16384) === this._attr.supported_features;
  }

  get supportsStop(): boolean {
    return !!this._attr.supported_features && (this._attr.supported_features | 4096) === this._attr.supported_features;
  }

  get progress(): number {
    if (this.isPlaying) {
      return this.position + (Date.now() - new Date(this.updatedAt).getTime()) / 1000.0;
    } else {
      return this.position;
    }
  }

  get idleView(): boolean {
    const idle = this.config.idle_view;
    if (
      (idle?.when_idle && this.isIdle) ||
      (idle?.when_standby && this.isStandby) ||
      (idle?.when_paused && this.isPaused)
    )
      return true;

    // TODO: remove?
    if (!this.updatedAt || !idle?.after || this.isPlaying) return false;

    return this.checkIdleAfter(idle.after);
  }

  get trackIdle(): boolean {
    return Boolean(this._active && !this.isPlaying && this.updatedAt && this.config?.idle_view?.after);
  }

  public checkIdleAfter(time: number): boolean {
    const diff = (Date.now() - new Date(this.updatedAt).getTime()) / 1000;
    this.idle = diff > time * 60;
    this._active = this.isActive;
    return this.idle;
  }

  get supportsShuffle(): boolean {
    return typeof this._attr.shuffle !== 'undefined';
  }

  get supportsRepeat(): boolean {
    return typeof this._attr.repeat !== 'undefined';
  }

  get supportsMute(): boolean {
    return typeof this._attr.is_volume_muted !== 'undefined';
  }

  get supportsVolumeSet(): boolean {
    return typeof this._attr.volume_level !== 'undefined';
  }

  get supportsMaster(): boolean {
    return this.platform !== PLATFORM.SQUEEZEBOX && this.config.speaker_group.supports_master;
  }

  async fetchArtwork(): Promise<string | false> {
    const url = this._attr.entity_picture_local ? this.hass.hassUrl(this.picture) : this.picture;

    try {
      const res = await fetch(new Request(url));
      const buffer = await res.arrayBuffer();
      const image64 = arrayBufferToBase64(buffer);
      const imageType = res.headers.get('Content-Type') || 'image/jpeg';
      return `url(data:${imageType};base64,${image64})`;
    } catch (error) {
      return false;
    }
  }

  // eslint-disable-next-line  @typescript-eslint/no-explicit-any
  getAttribute(attribute: keyof MediaPlayerEntityAttributes): any {
    return this._attr[attribute];
  }

  toggle(e: MouseEvent): void {
    if (this.config.toggle_power) return this.callService(e, 'toggle');
    if (this.isOff) return this.callService(e, 'turn_on');
    else this.callService(e, 'turn_off');
  }

  toggleMute(e: MouseEvent): void {
    if (this.config.speaker_group.sync_volume) {
      this.group.forEach((entity) => {
        this.callService(e, 'volume_mute', {
          entity_id: entity,
          is_volume_muted: !this.muted,
        });
      });
    } else {
      this.callService(e, 'volume_mute', { is_volume_muted: !this.muted });
    }
  }

  toggleShuffle(e: MouseEvent): void {
    this.callService(e, 'shuffle_set', { shuffle: !this.shuffle });
  }

  toggleRepeat(e: MouseEvent): void {
    const states = Object.values(REPEAT_STATE);
    const { length } = states;
    const currentIndex = states.indexOf(this.repeat) - 1;
    const nextState = states[(currentIndex - (1 % length) + length) % length];
    this.callService(e, 'repeat_set', { repeat: nextState });
  }

  setSource(e: Event, source: string): void {
    this.callService(e, 'select_source', { source });
  }

  // TODO: fix opts type
  setMedia(e: MouseEvent, opts: MediaPlayerMedia): void {
    this.callService(e, 'play_media', { ...opts });
  }

  play(e: MouseEvent): void {
    this.callService(e, 'media_play');
  }

  pause(e: MouseEvent): void {
    this.callService(e, 'media_pause');
  }

  playPause(e: MouseEvent): void {
    this.callService(e, 'media_play_pause');
  }

  playStop(e: MouseEvent): void {
    if (!this.isPlaying) this.callService(e, 'media_play');
    else this.callService(e, 'media_stop');
  }

  setSoundMode(e: Event, name: string): void {
    this.callService(e, 'select_sound_mode', { sound_mode: name });
  }

  next(e: MouseEvent): void {
    this.callService(e, 'media_next_track');
  }

  prev(e: MouseEvent): void {
    this.callService(e, 'media_previous_track');
  }

  stop(e: MouseEvent): void {
    this.callService(e, 'media_stop');
  }

  volumeUp(e: MouseEvent): void {
    if (this.supportsVolumeSet && this.config.volume_step && this.config.volume_step > 0) {
      this.callService(e, 'volume_set', {
        entity_id: this._entityId,
        volume_level: Math.min(this.vol + this.config.volume_step / 100, 1),
      });
    } else this.callService(e, 'volume_up');
  }

  volumeDown(e: MouseEvent): void {
    if (this.supportsVolumeSet && this.config.volume_step && this.config.volume_step > 0) {
      this.callService(e, 'volume_set', {
        entity_id: this._entityId,
        volume_level: Math.max(this.vol - this.config.volume_step / 100, 0),
      });
    } else this.callService(e, 'volume_down');
  }

  seek(e: MouseEvent, pos: number): void {
    this.callService(e, 'media_seek', { seek_position: pos });
  }

  jump(e: MouseEvent, amount: number): void {
    const newPosition = this.progress + amount;
    const clampedNewPosition = Math.min(Math.max(newPosition, 0), Number(this.mediaDuration) || newPosition);
    this.callService(e, 'media_seek', { seek_position: clampedNewPosition });
  }

  setVolume(e: MouseEvent, volume: number): void {
    if (this.config.speaker_group.sync_volume && this.config.speaker_group.entities) {
      this.group.forEach((entity) => {
        const conf = this.config.speaker_group.entities?.find((entry) => entry.entity_id === entity);

        if (typeof conf === 'undefined') return;

        let offsetVolume = volume;
        if (conf.volume_offset) {
          offsetVolume += conf.volume_offset / 100;
          if (offsetVolume > 1) offsetVolume = 1;
          if (offsetVolume < 0) offsetVolume = 0;
        }
        this.callService(e, 'volume_set', {
          entity_id: entity,
          volume_level: offsetVolume,
        });
      });
    } else {
      this.callService(e, 'volume_set', {
        entity_id: this._entityId,
        volume_level: volume,
      });
    }
  }

  handleGroupChange(e: Event, entity: string | string[], checked: boolean): void {
    const { platform } = this;
    const options: { entity_id: string | string[]; master?: string } = { entity_id: entity };
    if (checked) {
      options.master = this._entityId;
      switch (platform) {
        case PLATFORM.SOUNDTOUCH:
          return this.handleSoundtouch(e, this.isGrouped ? 'ADD_ZONE_SLAVE' : 'CREATE_ZONE', entity);
        case PLATFORM.SQUEEZEBOX:
          return this.callService(
            e,
            'sync',
            {
              entity_id: this._entityId,
              other_player: entity,
            },
            PLATFORM.SQUEEZEBOX,
          );
        case PLATFORM.MEDIAPLAYER:
        case PLATFORM.SONOS:
          return this.callService(
            e,
            'join',
            {
              entity_id: this._entityId,
              group_members: entity,
            },
            PLATFORM.MEDIAPLAYER,
          );
        case PLATFORM.HEOS:
          return this.callService(
            e,
            'join',
            {
              entity_id: this._entityId,
              group_members: this.group.concat(typeof entity === 'string' ? [entity] : entity),
            },
            PLATFORM.MEDIAPLAYER,
          );
        default:
          return this.callService(e, 'join', options, platform);
      }
    } else {
      switch (platform) {
        case PLATFORM.SOUNDTOUCH:
          return this.handleSoundtouch(e, 'REMOVE_ZONE_SLAVE', entity);
        case PLATFORM.SQUEEZEBOX:
          return this.callService(e, 'unsync', options, PLATFORM.SQUEEZEBOX);
        case PLATFORM.MEDIAPLAYER:
        case PLATFORM.SONOS:
          return this.callService(
            e,
            'unjoin',
            {
              entity_id: entity,
            },
            PLATFORM.MEDIAPLAYER,
          );
        case PLATFORM.HEOS:
          return this.callService(
            e,
            'unjoin',
            {
              entity_id: typeof entity === 'string' ? entity : entity[0],
            },
            PLATFORM.MEDIAPLAYER,
          );
        default:
          return this.callService(e, 'unjoin', options, platform);
      }
    }
  }

  handleSoundtouch(e: Event, service: string, entity: string | string[]): void {
    return this.callService(
      e,
      service,
      {
        master: this.master,
        slaves: entity,
      },
      PLATFORM.SOUNDTOUCH,
      true,
    );
  }

  toggleScript(e: MouseEvent, id: string, data: Record<string, string> = {}): void {
    const [, name] = id.split('.');
    this.callService(
      e,
      name,
      {
        ...data,
      },
      'script',
    );
  }

  // eslint-disable-next-line  @typescript-eslint/no-explicit-any
  toggleService(e: MouseEvent, id: string, data: Record<string, any> = {}): void {
    e.stopPropagation();
    const [domain, service] = id.split('.');
    this.hass.callService(domain, service, {
      ...data,
    });
  }

  // TODO: type available services
  // eslint-disable-next-line  @typescript-eslint/no-explicit-any
  callService(e: Event, service: string, inOptions?: Record<string, any>, domain = 'media_player', omit = false): void {
    e.stopPropagation();
    this.hass.callService(domain, service, {
      ...(!omit && { entity_id: this._entityId }),
      ...inOptions,
    });
  }
}
