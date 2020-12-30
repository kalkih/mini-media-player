const arrayBufferToBase64 = buffer => {
  let binary = '';
  const bytes = [].slice.call(new Uint8Array(buffer));

  // eslint-disable-next-line no-return-assign
  bytes.forEach(b => (binary += String.fromCharCode(b)));

  return window.btoa(binary);
};

export default arrayBufferToBase64;
