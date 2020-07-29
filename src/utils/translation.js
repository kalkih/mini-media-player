import translations from '../translations';

const DEFAULT_LANG = 'en';

const getNestedProp = (obj, path) => path.split('.').reduce((p, c) => p && p[c] || null, obj);

const translation = (hass, label, hassLabel = undefined, fallback = 'unknown') => {
  const lang = hass.selectedLanguage || hass.language;
  return translations[lang] && getNestedProp(translations[lang], label)
    || hass.resources[lang] && hass.resources[lang][hassLabel]
    || getNestedProp(translations[DEFAULT_LANG], label)
    || fallback;
};

export default translation;
