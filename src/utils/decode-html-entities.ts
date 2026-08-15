// Some media sources (e.g. certain internet radio stream metadata) send
// track/title text with HTML entities (`&amp;`, `&#39;`, `&#1605;`, ...)
// left encoded. Decoding via a detached <textarea> is safe: textarea content
// is parsed as text/RCDATA, so it can't execute embedded scripts, and it
// gives us the browser's own (complete, locale-correct) entity decoding
// instead of reimplementing it.
const decodeHtmlEntities = (text: string): string => {
  if (!text) return text;
  if (!text.includes('&')) return text;

  const el = document.createElement('textarea');
  el.innerHTML = text;
  return el.value;
};

export default decodeHtmlEntities;
