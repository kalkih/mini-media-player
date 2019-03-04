const MEDIA_INFO = [
  { attr: 'media_title' },
  { attr: 'media_artist' },
  { attr: 'media_series_title' },
  { attr: 'media_season', prefix: 'S' },
  { attr: 'media_episode', prefix: 'E' },
  { attr: 'app_name' },
];

const PROGRESS_PROPS = ['media_duration', 'media_position', 'media_position_updated_at'];

export default class MediaPlayerObject {
  constructor(hass, config, entity) {
    this.hass = hass || {};
    this.config = config || {};
    this.entity = entity || {};
    this.state = this.entity.state;
    this.attr = entity.attributes;
    this.idle = this.config.idle_view ? this.idleView : false;
    this.active = this.isActive;
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

  get group() {
    return this.attr.sonos_group || [];
  }

  get master() {
    return this.group[0] || this.config.entity;
  }

  get isMaster() {
    // TODO: TEST ENTITY HERE
    return this.master === this.config.entity;
  }

  get sources() {
    return this.attr.source_list || [];
  }

  get source() {
    return this.attr.source || '';
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
      && this.config.idle_view.after
    );
  }

  checkIdleAfter(time) {
    const diff = (Date.now() - new Date(this.updatedAt).getTime()) / 1000;
    this.idle = diff > time * 60;
    this.active = this.isActive;
    return this.idle;
  }

  get supportShuffle() {
    return !(typeof this.attr.shuffle === 'undefined');
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

  setSource(e, source) {
    this.callService(e, 'select_source', { source });
  }

  next(e) {
    this.callService(e, 'media_next_track');
  }

  setVolume(e) {
    let vol = parseFloat(e.target.value) / 100;
    if (this.config.sonos.sync_volume) {
      this.group.forEach((entity) => {
        const conf = this.config.sonos.entities.find(entry => (entry.entity_id === entity));
        if (conf.volume_offset) {
          vol += (conf.volume_offset / 100);
          if (vol > 1) vol = 1;
          if (vol < 0) vol = 0;
        }
        this.callService(e, 'volume_set', {
          entity_id: entity,
          volume_level: vol,
        });
      });
    } else {
      this.callService(e, 'volume_set', {
        entity_id: this.config.entity,
        volume_level: vol,
      });
    }
  }

  callService(e, service, inOptions) {
    e.stopPropagation();
    this.hass.callService('media_player', service, {
      entity_id: this.config.entity,
      ...inOptions,
    });
  }
}
