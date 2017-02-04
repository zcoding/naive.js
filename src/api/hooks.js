import { isArray } from '../utils';

export function addHook (hookName, callback) {
  let callbacks = this._hooks[hookName];
  if (!callbacks) {
    callbacks = [];
  }
  if (isArray(callback)) {
    callbacks = callbacks.concat(callback);
  } else {
    callbacks.push(callback);
  }
  this._hooks[hookName] = callbacks;
}

export function removeHook (hookName, callback) {
  const callbacks = this._hooks[hookName];
  if (!callbacks || callbacks.length === 0) {
    return this;
  }
  if (!callback) {
    callbacks.splice(0, callbacks.length);
  } else {
    for (let i = 0; i < callbacks.length; ++i) {
      if (callbacks[i] === callback) {
        callbacks.splice(i, 1);
        break;
      }
    }
  }
  return this;
}

export function callHooks (hookName) {
  const _callbacks = this._hooks[hookName] || [];
  for (let i = 0; i < _callbacks.length; ++i) {
    _callbacks[i].call(this);
  }
}
