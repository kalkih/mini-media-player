import { DEFAULT_HIDE, LABEL_SHORTCUT } from '../const';
import { MiniMediaPlayerActionEvent, MiniMediaPlayerBaseConfiguration, MiniMediaPlayerConfiguration } from './types';

const validate = (config: MiniMediaPlayerBaseConfiguration): void => {
  if (typeof config.entity === 'undefined') {
    throw new Error('You need to specify the required entity option.');
  }

  if (config.entity.split('.')[0] !== 'media_player') {
    throw new Error('Specify an entity from within the media_player domain.');
  }

  if (typeof config.type === 'undefined') {
    throw new Error('You need to specify the required type option.');
  }
};

export const generateConfig = (config: MiniMediaPlayerBaseConfiguration): MiniMediaPlayerConfiguration => {
  validate(config);

  const conf: MiniMediaPlayerConfiguration = {
    artwork: 'default',
    info: 'default',
    group: false,
    volume_stateless: false,
    more_info: true,
    source: 'default',
    sound_mode: 'default',
    toggle_power: true,
    tap_action: {
      action: MiniMediaPlayerActionEvent.MORE_INFO,
    },
    jump_amount: 10,
    ...config,
    hide: { ...DEFAULT_HIDE, ...config.hide },
    speaker_group: {
      show_group_count: true,
      platform: 'sonos',
      supports_master: true,
      entities: [],
      ...config.sonos,
      ...config.speaker_group,
    },
    shortcuts: {
      label: LABEL_SHORTCUT,
      ...config.shortcuts,
    },
    max_volume: Number(config.max_volume) ?? 100,
    min_volume: Number(config.min_volume) || 0,
  };

  conf.collapse = conf.hide.controls || conf.hide.volume;
  conf.info = conf.collapse && conf.info !== 'scroll' ? 'short' : conf.info;
  conf.flow = conf.hide.icon && conf.hide.name && conf.hide.info;

  return conf;
};

export default generateConfig;
