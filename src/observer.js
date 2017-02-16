import { parsePath, getObjectFromPath, setObjectFromPath } from './parser';
import { isPlainObject, isArray, hasOwn } from './utils';

function normalizePath(path) {
  var parts = parsePath(path);
  return parts.join('.');
}

export default function Observer(data) {
  this._data = data;
  this.subs = {};
}

var proto = Observer.prototype;

proto.sub = function(keyPath, callback) {
  keyPath = normalizePath(keyPath);
  var subs = this.subs[keyPath];
  (subs ? subs : (this.subs[keyPath] = [])).push(callback);
};

proto.get = function(key) {
  return getObjectFromPath(this._data, key);
};

proto.put = function(keyPath, newValue) {
  var paths = parsePath(keyPath);
  var oldValue = getObjectFromPath(this._data, keyPath);
  if (oldValue === newValue) {
    return;
  }
  var _isArray = isArray(newValue);
  if (isPlainObject(newValue)) {
    for (let p in newValue) {
      if (hasOwn(newValue, p)) {
        var childKeyPath = paths.slice(0);
        childKeyPath.push(p);
        childKeyPath = childKeyPath.join('.');
        var childNewValue = newValue[p];
        var childOldValue = getObjectFromPath(this._data, childKeyPath);
        var childKeySubs = this.subs[childKeyPath] || [];
        setObjectFromPath(this._data, childKeyPath, childNewValue);
        for (let i = 0; i < childKeySubs.length; ++i) {
          childKeySubs[i].call(null, childOldValue, childNewValue);
        }
      }
    }
  } else if (_isArray) { // 数组处理
  }
  setObjectFromPath(this._data, keyPath, newValue);
  let callbacks = this.subs[keyPath] || [];
  for (let i = 0; i < callbacks.length; ++i) {
    callbacks[i].call(null, oldValue, newValue);
  }
  if (_isArray && newValue.length !== oldValue.length) { // 由于数组的 length 是自动修改的，所以要单独处理
    let callbacks = this.subs[keyPath + '.length'] || [];
    for (let i = 0; i < callbacks.length; ++i) {
      callbacks[i].call(null, oldValue, newValue);
    }
  }
};
