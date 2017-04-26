const sliceArray = Array.prototype.slice;

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
  return sliceArray.call(obj, 0);
}

export function isUndefined (obj) {
  return void 0 === obj
}

export function noop () {}

function isObject(obj) {
  return 'object' === typeof obj
}

export function extend(dest) {
  const sources = sliceArray.call(arguments, 1)
  for (let i = 0; i < sources.length; ++i) {
    const src = sources[i]
    if (!isObject(src)) {
      if (isObject(dest)) {
        return dest
      } else {
        dest = src
      }
    } else if (!isObject(dest)) {
      if (src === null) {
        return dest
      } else {
        dest = extend({}, src)
      }
    } else {
      for (let p in src) {
        if (src.hasOwnProperty(p)) {
          if (isObject(src[p])) {
            dest[p] = extend(dest[p] || {}, src[p])
          } else {
            dest[p] = src[p]
          }
        }
      }
    }
  }
  return dest
}

export function clone(obj) {
  return extend({}, obj);
}

export function deepExtend(dest) {
  if (typeof dest !== 'object' || !dest) {
    return dest;
  }
  const sources = sliceArray.call(arguments, 1);
  while (sources.length) {
    const current = sources.shift();
    if (isArray(dest)) {
      if (isArray(current)) {
        for (let i = 0; i < dest.length; ++i) {
          deepExtend(dest[i], current[i]);
        }
      } else {
        // dest = 
      }
    } else if (isPlainObject(dest)) {
      // 注意可能无限递归
    } else {
    }
  }
  return dest;
}

export function isFunction (obj) {
  return typeof obj === 'function';
}

export function isPlainObject (obj) {
  return obj != null && typeof obj === 'object' && !isArray(obj) && Object.prototype.toString.call(obj) === '[object Object]';
}

export function hasOwn (obj, prop) {
  return obj.hasOwnProperty(prop);
}

let resolved = typeof Promise!=='undefined' && Promise.resolve();
export const defer = resolved ? (f => { resolved.then(f); }) : setTimeout; // asap async