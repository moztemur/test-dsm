// logger.js
import debug from 'debug';

const base = 'test-dsm';

export const createLogger = (submodule = '') => {
  return debug(submodule ? `${base}:${submodule}` : base);
};
