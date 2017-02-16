export function warn (message) {
  if (window.console) {
    console.warn(`[naive.js] ${message}`);
  }
}

export function error (message) {
  if (window.console) {
    console.error(`[naive.js] ${message}`);
  }
}

export const isArray = Array.isArray ? Array.isArray : function isArray (obj) {
  return Object.prototype.toString.call(obj) === '[object Array]';
};

export function toArray (obj) {
  return Array.prototype.slice.call(obj, 0);
}

export function isUndefined (obj) {
  return typeof obj === 'undefined';
}

export function noop () {}

export function extend(obj, props) {
  if (props) {
    for (let i in props) obj[i] = props[i];
  }
  return obj;
}

export function clone(obj) {
  return extend({}, obj);
}

export function isFunction (obj) {
  return typeof obj === 'function';
}

export function isPlainObject (obj) {
  return obj != null && typeof obj === 'object' && !isArray(obj) && Object.prototype.toString.call(obj) === '[object Object]';
}

let resolved = typeof Promise!=='undefined' && Promise.resolve();
export const defer = resolved ? (f => { resolved.then(f); }) : setTimeout; // asap async
