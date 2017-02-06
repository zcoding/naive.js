import { getElement, createElement, removeNode, createTextNode, createDocumentFragment, appendChild, replaceNode } from './dom';
import { diff, patch } from './vdom/vdom';
import h from './vdom/h';
import { isArray, warn, error, extend, clone, noop, isFunction, isPlainObject } from './utils';
import { parseExpression } from './parser';
import { addHook, removeHook, callHooks } from './api/hooks';
import { NaiveException } from './exception';
import { getObjectFromPath } from './parser';

const templateHelpers = {
  "if": function () { return false; },
  "each": function (item, list, state, h, node) {
    return [];
  },
  "_": function (state, item) {
    return getObjectFromPath(state, item);
  },
};

export default function Naive (options) {
  options = options || {};
  this._hooks = {};
  if (!isFunction(options.state)) {
    // 必须是 function
    throw new NaiveException('state 必须是 Function');
  }
  const _state = options.state();
  if (isPlainObject(_state)) {
    this.state = _state;
  } else {
    warn('state 必须是 plain object');
    this.state = {};
  }
  this.render = function render () {
    return options.render.call(this, h, templateHelpers);
  };
  this.ele = null;
  this._init(options);
}

Naive.createElement = h;

const prtt = Naive.prototype;

prtt.setState = function setState (state) {
  extend(this.state, state);
  this.update();
  return this;
};

// 更新视图
prtt.update = function update () {
  if (!this.mounted) { // 如果组件没有挂载到元素上，不需要更新视图
    return this;
  }
  const preVdom = this.vdom;
  this.vdom = this.render();
  // console.log(preVdom, this.vdom);
  const patches = diff(preVdom, this.vdom);
  // console.log(patches);
  if (patches) {
    patch(this, this.ele, patches);
  } else {
    warn('不需要更新视图');
  }
};

prtt._init = function _init (options) {
  const methods = options.methods || {};
  // 将 methods 移到 this
  for (let m in methods) {
    if (methods.hasOwnProperty(m)) {
      if (this.hasOwnProperty(m)) {
        warn(`属性 "${m}" 已存在`);
      } else {
        this[m] = methods[m];
      }
    }
  }
  const hooks = options.hooks || {};
  for (let p in hooks) {
    if (hooks.hasOwnProperty(p)) {
      this._addHook(p, hooks[p]);
    }
  }
  this.vdom = this.render();
};

prtt.mount = function mount (selector) {
  const mountPoint = getElement(selector);
  if (!mountPoint) {
    throw new NaiveException('找不到挂载节点');
  }
  const vdom = this.vdom;
  if (vdom.length) { // fragment
    const docFragment = createDocumentFragment();
    const simFragment = { childNodes: [] };
    for (let i = 0; i < vdom.length; ++i) {
      const node = vdom[i].render(this);
      simFragment.childNodes.push(node);
      appendChild(node, docFragment);
    }
    this.ele = simFragment;
    replaceNode(docFragment, mountPoint);
  } else {
    this.ele = vdom.render(this);
    replaceNode(this.ele, mountPoint);
  }
  this.mounted = true;
  this._callHooks('mounted');
};

prtt._callHooks = callHooks;

prtt._addHook = addHook;

prtt._removeHook = removeHook;

// 销毁组件
prtt.destroy = function destroy () {
  // 销毁事件监听
  // 调用 destroy 勾子
  this._callHooks('destroy');
  // 销毁勾子回调
  for (let p in this._hooks) {
    if (this._hooks.hasOwnProperty(p)) {
      this._removeHook(p);
    }
  }
};
