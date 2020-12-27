import MediaPlayer from './MediaPlayer';
import { PROGRESS_PROPS } from './const';
import arrayBufferToBase64 from './utils/misc';

export default class MediaPlayerExtended extends MediaPlayer {
  get hasArtwork() {
    return (this.picture
      && this.config.artwork !== 'none'
      && this.active
      && !this.idle);
  }

  get hasProgress() {
    return !this.config.hide.progress
      && !this.idle
      && PROGRESS_PROPS.every(prop => prop in this.attr);
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

  async fetchArtwork() {
    const url = this.attr.entity_picture_local ? this.hass.hassUrl(this.picture) : this.picture;

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
}
