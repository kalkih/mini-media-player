// Add additional languages with their ISO 639-1 language code

const translations = {
  en: {
    placeholder: {
      tts: 'Text to speak',
    },
    label: {
      leave: 'Leave',
      ungroup: 'Ungroup',
      group_all: 'Group all',
      send: 'Send',
      master: 'Master',
    },
    state: {
      idle: 'Idle',
      unavailable: 'Unavailable',
    },
    title: {
      speaker_management: 'Group management',
    },
  },
  fr: {
    placeholder: {
      tts: 'Texte à lire',
    },
    label: {
      leave: 'Quitter',
      ungroup: 'Dégrouper',
      group_all: 'Grouper tous',
      send: 'Envoyer',
    },
    state: {
      idle: 'Inactif',
      unavailable: 'Indisponible',
    },
    title: {
      speaker_management: 'Gestion des groupes',
    },
  },
  hu: {
    placeholder: {
      tts: 'Szövegfelolvasás',
    },
    label: {
      leave: 'Kilépés',
      ungroup: 'Összes kilép',
      group_all: 'Összes belép',
      send: 'Küldés',
      master: 'Forrás',
    },
    state: {
      idle: 'Tétlen',
      unavailable: 'Nem elérhető',
    },
    title: {
      speaker_management: 'Hangszóró csoportosítás',
    },
  },
  pl: {
    placeholder: {
      tts: 'Zamień tekst na mowę',
    },
    label: {
      leave: 'Opuść',
      ungroup: 'Usuń grupę',
      group_all: 'Grupuj wszystkie',
      send: 'Wyślij',
    },
    state: {
      idle: 'nieaktywny',
      unavailable: 'niedostępny',
    },
    title: {
      speaker_management: 'Zarządzanie grupą',
    },
  },
};

export default translations;
