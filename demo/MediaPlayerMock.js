const DOMAIN = 'media_player';

class MediaPlayerMock {
  constructor(entityId) {
    this.entityId = `${DOMAIN}.${entityId}`;
    this.state = {};
    this.populateInitialState();
  }

  handleServiceCall(service, data = {}) {
    switch (service) {
      case 'media_play_pause':
        this.state.state = ['paused', 'on'].includes(this.state.state) ? 'playing' : 'paused';
        if (this.state.state === this.state.state.paused) {
          this.state.attributes = {
            ...this.state.attributes,
            media_position:
              (new Date().getTime()
                - new Date(this.state.attributes.media_position_updated_at).getTime())
              / 1000,
            media_position_updated_at: new Date().toISOString(),
          };
        } else {
          this.state.attributes.media_position_updated_at = new Date().toISOString();
        }
        break;
      case 'volume_mute':
        this.state.attributes.is_volume_muted = !this.state.attributes.is_volume_muted;
        break;
      case 'select_source':
        this.state.attributes.source = data.source;
        break;
      case 'toggle':
        this.state.state = this.state.state === 'off' ? 'on' : 'off';
        break;
      case 'volume_set':
        this.state.attributes.volume_level = data.volume_level;
        break;
      case 'media_seek':
        this.state.attributes.media_position = data.seek_position;
        this.state.attributes.media_position_updated_at = new Date().toISOString();
        break;
      case 'join':
        if (this.state.attributes.group_members && this.state.attributes.group_members.length > 1) {
          this.state.attributes.group_members = [
            ...this.state.attributes.group_members,
            ...(typeof data.group_members === 'string' ? [data.group_members] : data.group_members),
          ];
        } else {
          this.state.attributes.group_members = [
            this.entityId,
            ...(typeof data.group_members === 'string' ? [data.group_members] : data.group_members),
          ];
        }
        break;
      case 'unjoin':
        if (this.state.attributes.group_members) {
          this.state.attributes.group_members = this.state.attributes.group_members.filter(entity => (typeof data.entity_id === 'string'
            ? entity !== data.entity_id
            : !data.entity_id.includes(entity)));
        }
        break;

      default:
        break;
    }
    this.state = { ...this.state };
  }

  populateInitialState() {
    this.state = {
      state: 'playing',
      attributes: {
        volume_level: 0.5,
        is_volume_muted: false,
        media_content_id: '',
        media_position: 0,
        media_position_updated_at: new Date().toISOString(),
        media_duration: 300,
        app_id: '',
        app_name: 'Spotify',
        // entity_picture_local: 'https://www.home-assistant.io/images/cast/splash.png',
        friendly_name: 'Player',
        supported_features: 152463,
        source_list: ['Source one', 'Source two', 'Source three'],
        source: 'Source one',
      },
    };
  }
}

export default MediaPlayerMock;
