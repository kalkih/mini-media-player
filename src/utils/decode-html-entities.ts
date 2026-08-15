// Some sources (e.g. players relaying a truncated fixed-length metadata
// buffer) cut text off mid-entity, leaving a dangling, unterminated
// numeric reference at the very end (`...&#1576;&#1593;&#1`). That
// fragment can never be decoded — there's no closing `;` — so drop it
// rather than render it as literal garbage.
//
// Deliberately numeric-only (`&#…`/`&#x…`), not named entities: a bare
// `&#` is never legitimate prose, so this can't misfire, whereas matching
// short named-entity-shaped suffixes could (e.g. "AT&T" ending in `&T`).
const TRAILING_INCOMPLETE_ENTITY = /&#x?[0-9a-fA-F]*$/;

const stripTrailingIncompleteEntity = (text: string): string => text.replace(TRAILING_INCOMPLETE_ENTITY, '');

// Some media sources (e.g. certain internet radio stream metadata) send
// track/title text with HTML entities (`&amp;`, `&#39;`, `&#1605;`, ...)
// left encoded. Decoding via a detached <textarea> is safe: textarea content
// is parsed as text/RCDATA, so it can't execute embedded scripts, and it
// gives us the browser's own (complete, locale-correct) entity decoding
// instead of reimplementing it.
const decodeHtmlEntities = (text: string): string => {
  if (!text) return text;
  if (!text.includes('&')) return text;

  const trimmed = stripTrailingIncompleteEntity(text);
  const el = document.createElement('textarea');
  el.innerHTML = trimmed;
  return el.value;
};

export default decodeHtmlEntities;
