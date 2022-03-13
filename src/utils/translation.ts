import translations from '../translations';
import { HomeAssistant } from '../types';

const DEFAULT_LANG = 'en';

const getNestedProp = (obj, path) => path.split('.').reduce((p, c) => (p && p[c]) || null, obj);

const translation = (hass: HomeAssistant, label: string, hassLabel?: string, fallback = 'unknown'): string => {
  const lang = hass.selectedLanguage || hass.language;
  const l639 = lang.split('-')[0];
  return (
    (translations[lang] && getNestedProp(translations[lang], label)) ||
    (hass.resources[lang] && hassLabel && hass.resources[lang][hassLabel]) ||
    (translations[l639] && getNestedProp(translations[l639], label)) ||
    getNestedProp(translations[DEFAULT_LANG], label) ||
    fallback
  );
};

export default translation;
