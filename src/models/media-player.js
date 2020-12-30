import { PROGRESS_PROPS, MEDIA_INFO, PLATFORM } from '../consts.js';
import arrayBufferToBase64 from '../utils/misc.js';

export default class MediaPlayer {
  constructor(hass, config, entity) {
    this.hass = hass || {};
    this.config = config || {};
    this.entity = entity || {};
    this.state = entity.state;
    this.attr = entity.attributes;
    this.idle = config.idle_view ? this.idleView : false;
    this.active = this.isActive;
  }

  get id() {
    return this.entity.entity_id;
  }

  get icon() {
    return this.attr.icon;
  }

  get isPaused() {
    return this.state === 'paused';
  }

  get isPlaying() {
    return this.state === 'playing';
  }

  get isIdle() {
    return this.state === 'idle';
  }

  get isStandby() {
    return this.state === 'standby';
  }

  get isUnavailable() {
    return this.state === 'unavailable';
  }

  get isOff() {
    return this.state === 'off';
  }

  get isActive() {
    return (!this.isOff && !this.isUnavailable && !this.idle) || false;
  }

  get shuffle() {
    return this.attr.shuffle || false;
  }

  get content() {
    return this.attr.media_content_type || 'none';
  }

  get mediaDuration() {
    return this.attr.media_duration || 0;
  }

  get updatedAt() {
    return this.attr.media_position_updated_at || 0;
  }

  get position() {
    return this.attr.media_position || 0;
  }

  get name() {
    return this.attr.friendly_name || '';
  }

  get groupCount() {
    return this.group.length;
  }

  get isGrouped() {
    return this.group.length > 1;
  }

  get group() {
    if (this.platform === PLATFORM.SQUEEZEBOX) {
      return this.attr.sync_group || [];
    }
    return this.attr[`${this.platform}_group`] || [];
  }

  get platform() {
    return this.config.speaker_group.platform;
  }

  get master() {
    return this.supportsMaster
      ? this.group[0] || this.config.entity
      : this.config.entity;
  }

  get isMaster() {
    return this.master === this.config.entity;
  }

  get sources() {
    return this.attr.source_list || [];
  }

  get source() {
    return this.attr.source || '';
  }

  get soundModes() {
    return this.attr.sound_mode_list || [];
  }

  get soundMode() {
    return this.attr.sound_mode || '';
  }

  get muted() {
    return this.attr.is_volume_muted || false;
  }

  get vol() {
    return this.attr.volume_level || 0;
  }

  get picture() {
    return this.attr.entity_picture_local || this.attr.entity_picture;
  }

  get hasArtwork() {
    return (
      this.picture &&
      this.config.artwork !== 'none' &&
      this.active &&
      !this.idle
    );
  }

  get mediaInfo() {
    return MEDIA_INFO.map(item => ({
      text: this.attr[item.attr],
      prefix: '',
      ...item,
    })).filter(item => item.text);
  }

  get hasProgress() {
    return (
      !this.config.hide.progress &&
      !this.idle &&
      PROGRESS_PROPS.every(prop => prop in this.attr)
    );
  }

  get progress() {
    return (
      this.position + (Date.now() - new Date(this.updatedAt).getTime()) / 1000.0
    );
  }

  get idleView() {
    const idle = this.config.idle_view;
    if (
      (idle.when_idle && this.isIdle) ||
      (idle.when_standby && this.isStandby) ||
      (idle.when_paused && this.isPaused)
    )
      return true;

    // TODO: remove?
    if (!this.updatedAt || !idle.after || this.isPlaying) return false;

    return this.checkIdleAfter(idle.after);
  }

  get trackIdle() {
    return (
      this.active &&
      !this.isPlaying &&
      this.updatedAt &&
      this.config.idle_view &&
      this.config.idle_view.after
    );
  }

  checkIdleAfter(time) {
    const diff = (Date.now() - new Date(this.updatedAt).getTime()) / 1000;
    this.idle = diff > time * 60;
    this.active = this.isActive;
    return this.idle;
  }

  get supportsShuffle() {
    return !(typeof this.attr.shuffle === 'undefined');
  }

  get supportsMute() {
    return !(typeof this.attr.is_volume_muted === 'undefined');
  }

  get supportsVolumeSet() {
    return !(typeof this.attr.volume_level === 'undefined');
  }

  get supportsMaster() {
    return this.platform !== PLATFORM.SQUEEZEBOX;
  }

  async fetchArtwork() {
    const url = this.attr.entity_picture_local
      ? this.hass.hassUrl(this.picture)
      : this.picture;

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

  getAttribute(attribute) {
    return this.attr[attribute] || '';
  }

  toggle(e) {
    if (this.config.toggle_power) this.callService(e, 'toggle');
    else if (this.isOff) this.callService(e, 'turn_on');
    else this.callService(e, 'turn_off');
  }

  toggleMute(e) {
    if (this.config.speaker_group.sync_volume) {
      this.group.forEach(entity => {
        this.callService(e, 'volume_mute', {
          entity_id: entity,
          is_volume_muted: !this.muted,
        });
      });
    } else {
      this.callService(e, 'volume_mute', { is_volume_muted: !this.muted });
    }
  }

  toggleShuffle(e) {
    this.callService(e, 'shuffle_set', { shuffle: !this.shuffle });
  }

  setSource(e, source) {
    this.callService(e, 'select_source', { source });
  }

  setMedia(e, opts) {
    this.callService(e, 'play_media', { ...opts });
  }

  playPause(e) {
    this.callService(e, 'media_play_pause');
  }

  playStop(e) {
    if (!this.isPlaying) this.callService(e, 'media_play');
    else this.callService(e, 'media_stop');
  }

  setSoundMode(e, name) {
    this.callService(e, 'select_sound_mode', { sound_mode: name });
  }

  next(e) {
    this.callService(e, 'media_next_track');
  }

  prev(e) {
    this.callService(e, 'media_previous_track');
  }

  stop(e) {
    this.callService(e, 'media_stop');
  }

  volumeUp(e) {
    if (this.supportsVolumeSet && this.config.volume_step > 0) {
      this.callService(e, 'volume_set', {
        entity_id: this.config.entity,
        volume_level: Math.min(this.vol + this.config.volume_step / 100, 1),
      });
    } else this.callService(e, 'volume_up');
  }

  volumeDown(e) {
    if (this.supportsVolumeSet && this.config.volume_step > 0) {
      this.callService(e, 'volume_set', {
        entity_id: this.config.entity,
        volume_level: Math.max(this.vol - this.config.volume_step / 100, 0),
      });
    } else this.callService(e, 'volume_down');
  }

  seek(e, pos) {
    this.callService(e, 'media_seek', { seek_position: pos });
  }

  setVolume(e, vol) {
    if (this.config.speaker_group.sync_volume) {
      this.group.forEach(entity => {
        const conf =
          this.config.speaker_group.entities.find(
            entry => entry.entity_id === entity
          ) || {};
        let offsetVol = vol;
        if (conf.volume_offset) {
          offsetVol += conf.volume_offset / 100;
          if (offsetVol > 1) offsetVol = 1;
          if (offsetVol < 0) offsetVol = 0;
        }
        this.callService(e, 'volume_set', {
          entity_id: entity,
          volume_level: offsetVol,
        });
      });
    } else {
      this.callService(e, 'volume_set', {
        entity_id: this.config.entity,
        volume_level: vol,
      });
    }
  }

  handleGroupChange(e, entity, checked) {
    const { platform } = this;
    const options = { entity_id: entity };
    if (checked) {
      options.master = this.config.entity;
      switch (platform) {
        case PLATFORM.SOUNDTOUCH:
          return this.handleSoundtouch(
            e,
            this.isGrouped ? 'ADD_ZONE_SLAVE' : 'CREATE_ZONE',
            entity
          );
        case PLATFORM.SQUEEZEBOX:
          return this.callService(
            e,
            'sync',
            {
              entity_id: this.config.entity,
              other_player: entity,
            },
            PLATFORM.SQUEEZEBOX
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
        default:
          return this.callService(e, 'unjoin', options, platform);
      }
    }
  }

  handleSoundtouch(e, service, entity) {
    return this.callService(
      e,
      service,
      {
        master: this.master,
        slaves: entity,
      },
      PLATFORM.SOUNDTOUCH,
      true
    );
  }

  toggleScript(e, id, data = {}) {
    this.callService(
      e,
      id.split('.').pop(),
      {
        ...data,
      },
      'script'
    );
  }

  toggleService(e, id, data = {}) {
    e.stopPropagation();
    const [domain, service] = id.split('.');
    this.hass.callService(domain, service, {
      ...data,
    });
  }

  callService(e, service, inOptions, domain = 'media_player', omit = false) {
    e.stopPropagation();
    this.hass.callService(domain, service, {
      ...(!omit && { entity_id: this.config.entity }),
      ...inOptions,
    });
  }
}
