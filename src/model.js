import { PROGRESS_PROPS, MEDIA_INFO } from './const';

export default class MediaPlayerObject {
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
    return (!this.isOff
      && !this.isUnavailable
      && !this.idle) || false;
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
    const groupName = `${this.config.speaker_group.platform}_group`;
    return this.attr[groupName] || [];
  }

  get master() {
    return this.group[0] || this.config.entity;
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
    return this.attr.entity_picture;
  }

  get hasArtwork() {
    return (this.picture
      && this.config.artwork !== 'none'
      && this.active
      && !this.idle);
  }

  get mediaInfo() {
    return MEDIA_INFO.map(item => ({
      text: this.attr[item.attr],
      prefix: '',
      ...item,
    })).filter(item => item.text);
  }

  get hasProgress() {
    return !this.config.hide.progress
      && !this.idle
      && PROGRESS_PROPS.every(prop => prop in this.attr);
  }

  get progress() {
    return this.position + (Date.now() - new Date(this.updatedAt).getTime()) / 1000.0;
  }

  get idleView() {
    const idle = this.config.idle_view;
    if (idle.when_idle && this.isIdle
      || idle.when_standby && this.isStandby
      || idle.when_paused && this.isPaused)
      return true;

    // TODO: remove?
    if (!this.updatedAt || !idle.after || this.isPlaying)
      return false;

    return this.checkIdleAfter(idle.after);
  }

  get trackIdle() {
    return (
      this.active
      && !this.isPlaying
      && this.updatedAt
      && this.config.idle_view
      && this.config.idle_view.after
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

  getAttribute(attribute) {
    return this.attr[attribute] || '';
  }

  async fetchThumbnail() {
    try {
      const { content_type: contentType, content } = await this.hass.callWS({
        type: 'media_player_thumbnail',
        entity_id: this.config.entity,
      });
      return `url(data:${contentType};base64,${content})`;
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('mini-media-player: Failed fetching thumbnail');
      return false;
    }
  }

  toggle(e) {
    if (this.config.toggle_power)
      return this.callService(e, 'toggle');
    if (this.isOff)
      return this.callService(e, 'turn_on');
    else
      this.callService(e, 'turn_off');
  }

  toggleMute(e) {
    this.callService(e, 'volume_mute', { is_volume_muted: !this.muted });
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
    if (!this.isPlaying)
      this.callService(e, 'media_play');
    else
      this.callService(e, 'media_stop');
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
    this.callService(e, 'volume_up');
  }

  volumeDown(e) {
    this.callService(e, 'volume_down');
  }

  seek(e, pos) {
    this.callService(e, 'media_seek', { seek_position: pos });
  }

  setVolume(e, vol) {
    if (this.config.speaker_group.sync_volume) {
      this.group.forEach((entity) => {
        const conf = this.config.speaker_group.entities.find(entry => (entry.entity_id === entity))
          || {};
        let offsetVol = vol;
        if (conf.volume_offset) {
          offsetVol += (conf.volume_offset / 100);
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
    const { platform } = this.config.speaker_group;
    const options = { entity_id: entity };
    if (checked) {
      options.master = this.config.entity;
      if (platform === 'bluesound') {
        return this.callService(e, `${platform}_JOIN`, options);
      }
      this.callService(e, 'join', options, platform);
    } else {
      if (platform === 'bluesound') {
        return this.callService(e, `${platform}_UNJOIN`, options);
      }
      this.callService(e, 'unjoin', options, platform);
    }
  }

  toggleScript(e, id, data = {}) {
    this.callService(e, id.split('.').pop(), {
      ...data,
    }, 'script');
  }

  toggleService(e, id, data = {}) {
    e.stopPropagation();
    const [domain, service] = id.split('.');
    this.hass.callService(domain, service, {
      ...data,
    });
  }

  callService(e, service, inOptions, domain = 'media_player') {
    e.stopPropagation();
    this.hass.callService(domain, service, {
      entity_id: this.config.entity,
      ...inOptions,
    });
  }
}
