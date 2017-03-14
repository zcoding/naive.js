import { getElement, appendChild, replaceNode, removeNode } from './dom';
import { diff } from './vdom/diff';
import { applyPatch } from './vdom/patch';
import h from './vdom/h';
import { warn, extend, isFunction, isPlainObject, toArray, isArray } from './utils';
import { addHook, removeHook, callHooks } from './api/hooks';
import { NaiveException } from './exception';

let componentId = 1;

// 因为是在应用内生成的组件，所以不需要用 uuid 算法，只需要保证在应用内唯一即可
function uuid() {
  return '$naive-component-' + componentId++ + new Date().getTime();
}

function emptyRender () {
  return null;
}

export default function Naive (options) {
  options = options || {};
  this.name = options.name || '';
  this.key = options.key || uuid();
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
  this.props = {};
  const combineProps = {};
  // 合并 state 和 options.props
  if (options.props) {
    for (let p in options.props) {
      if (options.props.hasOwnProperty(p)) {
        this.props[p] = options.props[p];
        if (/^:/.test(p)) {
          combineProps[p.slice(1)] = options.props[p];
        } else {
          combineProps[p] = String(options.props[p]);
        }
      }
    }
  }
  extend(this.state, combineProps);
  const context = this;
  const _vdomRender = options.render || emptyRender;
  const _templateHelpers = {
    "if": function (condition, options) {
      condition = !!condition;
      return condition ? h(options) : condition;
    },
    "each": function (list, createItem) {
      const nodes = [];
      if (isArray(list)) {
        for (let i = 0; i < list.length; ++i) {
          const item = list[i];
          const key = isPlainObject(item) && 'id' in item ? item['id'] : i;
          nodes.push(h(createItem.call(context, item, i, key)));
        }
      } else {
        for (let p in list) {
          if (list.hasOwnProperty(p)) {
            const item = list[p];
            const key = isPlainObject(item) && 'id' in item ? item['id'] : p;
            nodes.push(h(createItem.call(context, item, p, key)));
          }
        }
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
  this.$root = null; // 第一次 render 之后才会生成 $root
  this.components = {}; // 组件描述对象列表
  this._components = {}; // 组件实例映射
  const componentsOptions = options.components || {};
  for (let p in componentsOptions) {
    if (componentsOptions.hasOwnProperty(p)) {
      const componentDefine = componentsOptions[p] || {};
      componentDefine.name = componentDefine.name || p;
      componentDefine.parent = this;
      this.components[p] = createComponentCreator(this, componentDefine);
    }
  }
  this.parent = options.parent || null;
  this._init(options);
  this._callHooks('created');
}

function createComponentCreator (context, componentDefine) {
  return function createComponent(props, children, key) {
    if (!key || !context._components[key]) {
      const options = extend({}, componentDefine, {props: props, key: key});
      const newChild = new Naive(options);
      context._components[key] = newChild;
    } else {
      updateProps(context._components[key], props);
    }
    return context._components[key];
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
  if (!this.$root) {
    return this;
  }
  const preVdom = this.vdom;
  this.vdom = this.vdomRender();
  // console.log(preVdom, this.vdom);
  const patches = diff(preVdom, this.vdom);
  // console.log(patches);
  if (patches) {
    applyPatch(this, this.$root, patches);
  } else {
    warn('不需要更新视图');
  }
  this._callHooks('updated');
  return this;
};

function updateProps (component, props) {
  const combineProps = {};
  if (props) {
    for (let p in props) {
      if (props.hasOwnProperty(p)) {
        component.props[p] = props[p];
        if (/^:/.test(p)) {
          combineProps[p.slice(1)] = props[p];
        } else {
          combineProps[p] = String(props[p]);
        }
      }
    }
  }
  extend(component.state, combineProps);
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
  if (options.init) {
    options.init.call(this);
  }
  this.vdom = this.vdomRender();
};

prtt.mount = function mount (selector) {
  const mountPoint = typeof selector === 'string' ? getElement(selector) : selector;
  if (!mountPoint) {
    throw new NaiveException('找不到挂载节点');
  }
  if (this.$root) {
    replaceNode(this.$root, mountPoint);
  } else {
    replaceNode(this.render(), mountPoint);
  }
  this._callHooks('mounted');
};

prtt.unmount = function unmount () {
  if (!this.$root) {
    return this;
  }
  removeNode(this.$root);
  this._callHooks('unmounted');
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
