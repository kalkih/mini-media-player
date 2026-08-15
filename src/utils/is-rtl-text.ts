// Heuristic: treat text as RTL if it contains any strong right-to-left
// character (Hebrew, Arabic and its supplements/presentation forms, Thaana,
// N'Ko, and explicit RTL formatting marks). Good enough for choosing a
// marquee direction without pulling in a full bidi implementation.
const RTL_REGEX = /[\u0591-\u05F4\u0600-\u06FF\u0750-\u077F\u0780-\u07BF\u07C0-\u07FF\u200F\u202B\u202E\u2067\uFB1D-\uFDFF\uFE70-\uFEFC]/;

const isRtlText = (text: string): boolean => RTL_REGEX.test(text);

export default isRtlText;
