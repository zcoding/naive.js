import { getElement, createElement, removeNode, createTextNode, createDocumentFragment } from './dom';
import { diff, applyPatch } from './vdom/vdom';
import h from './vdom/h';
import { isArray } from './utils';

function defaultRender () {
  return h('component', [], []);
}

export default function Naive (options) {
  this._hooks = {};
  this._methods = {};
  this._store = options.store || null;
  this._render = options.render || defaultRender; // render virtual-dom
  this._vdom = this._render(h, this.getState());
  this.$el = null;
  this._mounted = false;
}

const prtt = Naive.prototype;

prtt.getState = function getState () {
  return this._store ? this._store.getState() : this._state;
};

prtt.test = function test () {
  const vdom = this._render(h, this.getState());
  if (vdom.length) {
    var docFragment = createDocumentFragment();
    for (let i = 0; i < vdom.length; ++i) {
      docFragment.appendChild(typeof vdom[i] === 'string' ? createTextNode(vdom[i]) : vdom[i].render());
    }
    document.body.appendChild(docFragment);
  } else {
    document.body.appendChild(vdom.render());
  }
  return this;
};

prtt.render = function render () {
  const _vdom = this._render(h, this.getState());
  const patches = diff(_vdom, this._vdom);
  applyPatch(patches);
};

prtt._init = function () {};

prtt.$mount = function (selector, replace = true) {
  this.$el = getElement(selector) || createElement('div');
  const _dom = this._render(h).render();
  this.$el.appendChild(_dom);
  this._callHooks('ready');
};

prtt.$unmount = function () {
  removeNode(this.$el);
  this.$el = null;
};

prtt._callHooks = function callHooks (hookName) {
  const _callbacks = this._hooks[hookName] || [];
  for (let i = 0; i < _callbacks.length; ++i) {
    _callbacks[i].call(this);
  }
};

prtt._addHook = function addHook (hookName, callback) {
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
};

prtt._removeHook = function removeHook (hookName, callback) {
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
};

prtt.$dispatch = function $dispatch (action) {};

const _templateHelpers = {
  each(list) {
    let hList = [];
    for (let i = 0; i < list.length; ++i) {
      hList.push(h(list[i]));
    }
    return hList;
  },
  if(condition, vdom) {
    return condition ? h(vdom) : false;
  },
  _() {}
};

// 组件
Naive.Component = function NaiveComponent (options) {
  var naive = new Naive({
    state: options.state,
    store: options.stote,
    render: function render (h, state) {
      return options.render(h, _templateHelpers, state);
    }
  });
  return naive;
};
