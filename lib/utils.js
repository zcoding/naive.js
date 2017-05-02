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

export const isArray = Array.isArray || function isArray(arr) {
  return Object.prototype.toString.call(arr) === '[obejct Array]'
}

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

export function clone(obj) {
  return deepExtend({}, obj)
}

export function hasOwn (obj, prop) {
  return obj.hasOwnProperty(prop);
}

let resolved = typeof Promise!=='undefined' && Promise.resolve();
export const defer = resolved ? (f => { resolved.then(f); }) : setTimeout; // asap async



// IE8
export function isFunction(obj) {
  return 'function' === typeof obj
}

export function isString(obj) {
  return 'string' === typeof obj
}

function plainObject() {
  return {}
}

function hasOwnProp() {
  return plainObject().hasOwnProperty
}

// IE8+
export function isPlainObject(obj) {
  if (!obj || Object.prototype.toString.call( obj ) !== '[object Object]') {
    return false
  }

  var proto = Object.getPrototypeOf(obj)

  if (!proto) {
    return true
  }

  var Ctor = hasOwnProp.call(proto, 'constructor') && proto.constructor
  return typeof Ctor === 'function' && hasOwnProp.toString.call(Ctor) === hasOwnProp.toString.call(Object)
}

// IE8+
export function deepExtend() {
  var options, name, src, copy, copyIsArray, clone
  var target = arguments[0] || {}
  var length = arguments.length

  if (!isObject(target) && !isFunction(target)) {
    target = {}
  }

  for (var i = 1; i < length; i++) {
    if ((options = arguments[i]) != null ) {

      if (isString(options)) {
        continue
      }

      for (name in options) {
        src = target[name]
        copy = options[name]

        // 防止循环引用
        if (target === copy) {
          continue
        }

        // Recurse if we're merging plain objects or arrays
        if (copy && (isPlainObject(copy) || (copyIsArray = isArray(copy)))) {

          if (copyIsArray) {
            copyIsArray = false
            clone = src && isArray(src) ? src : []
          } else {
            clone = src && isPlainObject(src) ? src : {}
          }

          // Never move original objects, clone them
          target[name] = deepExtend(clone, copy)
          target[name] = deepExtend(clone, copy)

        // Don't bring in undefined values
        } else if (copy !== undefined) {
          target[name] = copy
        }
      }
    }
  }

  // Return the modified object
  return target
}
