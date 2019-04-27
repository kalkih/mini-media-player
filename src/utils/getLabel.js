const getLabel = (hass, label, fallback = 'unknown') => {
  const lang = hass.selectedLanguage || hass.language;
  const resources = hass.resources[lang];
  return (resources && resources[label] ? resources[label] : fallback);
};

export default getLabel;
