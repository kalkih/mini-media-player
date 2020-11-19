import {
  DEFAULT_HIDE,
  LABEL_SHORTCUT,
} from '../const';

const validate = (config) => {
  if (!config.entity || config.entity.split('.')[0] !== 'media_player')
    throw new Error('Specify an entity from within the media_player domain.');
};

export const generateConfig = (config) => {
  validate(config);

  const conf = {
    artwork: 'default',
    info: 'default',
    group: false,
    volume_stateless: false,
    more_info: true,
    source: 'default',
    sound_mode: 'default',
    toggle_power: true,
    volume_step: null,
    tap_action: {
      action: 'more-info',
    },
    ...config,
    hide: { ...DEFAULT_HIDE, ...config.hide },
    speaker_group: {
      show_group_count: true,
      platform: 'sonos',
      ...config.sonos,
      ...config.speaker_group,
    },
    shortcuts: {
      label: LABEL_SHORTCUT,
      ...config.shortcuts,
    },
  };
  conf.max_volume = Number(conf.max_volume) || 100;
  conf.min_volume = Number(conf.min_volume) || 0;
  conf.collapse = (conf.hide.controls || conf.hide.volume);
  conf.info = conf.collapse && conf.info !== 'scroll' ? 'short' : conf.info;
  conf.flow = (conf.hide.icon && conf.hide.name && conf.hide.info);

  return conf;
};

export default generateConfig;
