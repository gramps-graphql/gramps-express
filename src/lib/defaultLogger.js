const noop = () => {
  // no-op so calls to the logger don’t fail
};

const defaultLogger = {
  info: noop,
  log: noop,
  warn: noop,
  error: msg => console.error(msg), // eslint-disable-line no-console
};

export default defaultLogger;
