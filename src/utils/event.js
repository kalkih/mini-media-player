const fire = (type, inDetail, inOptions) => {
  const options = inOptions || {};
  const detail = inDetail === null || inDetail === undefined ? {} : inDetail;
  const e = new Event(type, {
    bubbles: options.bubbles === undefined ? true : options.bubbles,
    cancelable: Boolean(options.cancelable),
    composed: options.composed === undefined ? true : options.composed,
  });
  e.detail = detail;
  this.dispatchEvent(e);
  return e;
};

export default { fire };
