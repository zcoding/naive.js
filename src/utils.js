export function warn (message) {
  if (window.console) {
    console.warn(`[naive] ${message}`);
  }
}

export const isArray = Array.isArray ? Array.isArray : function isArray (obj) {
  return Object.prototype.toString.call(obj) === '[object Array]';
};

export function isUndefined (obj) {
  return typeof obj === 'undefined';
}
