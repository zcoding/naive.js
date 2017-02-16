import { getElement, appendChild, replaceNode } from './dom';
import { diff } from './vdom/diff';
import { patch } from './vdom/patch';
import h from './vdom/h';
import { warn, extend, isFunction, isPlainObject, toArray } from './utils';
import { addHook, removeHook, callHooks } from './api/hooks';
import { NaiveException } from './exception';

function emptyRender () {
  return null;
}

export default function Naive (options) {
  options = options || {};
  this.name = options.name || '';
  this._hooks = {};
  if ('state' in options) {
    if (!isFunction(options.state)) {
      throw new NaiveException('state 必须是 [Function]');
    }
    const _state = options.state();
    if (isPlainObject(_state)) {
      this.state = _state;
    } else {
      throw new NaiveException('state 必须返回 [Plain Object]');
    }
  } else {
    this.state = {};
  }
  const context = this;
  const _vdomRender = options.render || emptyRender;
  const _templateHelpers = {
    "if": function (condition, options) {
      return condition ? h(options) : condition;
    },
    "each": function (list, createItem) {
      const nodes = [];
      for (let i = 0; i < list.length; ++i) {
        const item = list[i];
        const key = isPlainObject(item) && 'id' in item ? item['id'] : i;
        nodes.push(h(createItem.call(context, item, i, key)));
      }
      return nodes;
    }
  };
  this.vdomRender = function vdomRender () {
    const vdom = _vdomRender.call(
      this,
      function createVdom () {
        return h.apply(context, toArray(arguments));
      },
      _templateHelpers
    );
    return vdom;
  };
  this.$root = null;
  // components
  this.components = {};
  const componentsOptions = options.components || {};
  for (let p in componentsOptions) {
    if (componentsOptions.hasOwnProperty(p)) {
      const componentDefine = componentsOptions[p] || {};
      componentDefine.name = componentDefine.name || p;
      context.components[p] = createComponentCreator(this, componentDefine);
    }
  }
  this._init(options);
}

function createComponentCreator (context, componentDefine) {
  return function createComponent() {
    return new Naive(componentDefine);
  };
}

const prtt = Naive.prototype;

prtt.render = function render () {
  this.$root = this.vdom.render(this);
  return this.$root;
};

prtt.setState = function setState (state) {
  extend(this.state, state);
  this.update(); // @TODO nextTick 的时候再 update
  return this;
};

// 更新视图
prtt.update = function update () {
  if (!this.mounted) { // 如果组件没有挂载到元素上，不需要更新视图
    return this;
  }
  const preVdom = this.vdom;
  this.vdom = this.vdomRender();
  // console.log(preVdom, this.vdom);
  const patches = diff(preVdom, this.vdom);
  // console.log(patches);
  if (patches) {
    patch(this, this.$root, patches);
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
  this.vdom = this.vdomRender();
};

prtt.mount = function mount (selector) {
  const mountPoint = typeof selector === 'string' ? getElement(selector) : selector;
  if (!mountPoint) {
    throw new NaiveException('找不到挂载节点');
  }
  replaceNode(this.render(), mountPoint);
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
