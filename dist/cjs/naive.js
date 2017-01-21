'use strict';

var isArray = Array.isArray ? Array.isArray : function isArray(obj) {
  return Object.prototype.toString.call(obj) === '[object Array]';
};

function getElement(selector) {
  return typeof selector === 'string' ? query(selector) : selector;
}

function createElement(tag) {
  return document.createElement(tag);
}

function createTextNode(text) {
  return document.createTextNode(text);
}

function createDocumentFragment() {
  return document.createDocumentFragment();
}

function query(selector, context) {
  context = context || document;
  return context.querySelector(selector);
}

/**
 * 检查一个元素是否在 document 内
 */


function removeNode(node) {
  node.parentNode.removeChild(node);
}

function diff(oldTree, newTree) {
  var index = 0;
  var patches = {};
  diffWalk(oldTree, newTree, index, patches);
  return patches;
}

function diffWalk(oldTree, newTree, index, patches) {
  var currentPatches = [];
  if (oldTree.tagName === newTree.tagName) {
    var propsPatches = diffProps(oldTree, newTree);
    if (propsPatches) {
      currentPatches.push({ type: 'props', props: propsPatches });
    }
  } else {
    currentPatches.push({ type: 'replace', node: newTree });
  }
  patches[index] = currentPatches;
}

function diffProps(oldTree, newTree) {
  var oldTreeProps = oldTree.props;
  var newTreeProps = newTree.props;
  var propsPatches = {},
      count = 0;
  for (var p in oldTreeProps) {
    if (!newTreeProps.hasOwnProperty(p) || newTreeProps[p] !== oldTreeProps[p]) {
      propsPatches[p] = newTreeProps[p];
      count += 1;
    }
  }
  if (count <= 0) {
    return null;
  }
  return propsPatches;
}

function applyPatch(domNode, patches) {}

function VText(text) {
  this.data = text;
}

VText.prototype.render = function vdom2dom() {
  return createTextNode(this.data);
};

function isVNode(node) {
  return node instanceof VNode;
}

function isVText(node) {
  return node instanceof VText;
}

function VNode(tagName, props, children, key) {
  this.tagName = tagName;
  this.props = props || {};
  this.key = key ? String(key) : undefined; // key 用来标识节点，方便 diff
  var childNodes = [];
  children = children || [];
  for (var i = 0; i < children.length; ++i) {
    var child = children[i];
    if (isVNode(child) || isVText(child)) {
      childNodes.push(child);
    } else if (typeof child === 'string') {
      childNodes.push(new VText(child));
    } else {
      // error
    }
  }
  this.children = childNodes;
}

VNode.prototype.render = function vdom2dom() {
  var el = createElement(this.tagName);
  var props = this.props;
  for (var p in props) {
    el.setAttribute(p, props[p]);
  }
  for (var i = 0; i < this.children.length; ++i) {
    el.appendChild(this.children[i].render());
  }
  return el;
};

function h(tagName, props, children) {
  return new VNode(tagName, props, children);
}

function defaultRender() {
  return h('component', [], []);
}

function Naive(options) {
  this._hooks = {};
  this._methods = {};
  this._store = options.store || null;
  this._render = options.render || defaultRender; // render virtual-dom
  this._vdom = this._render(h, this.getState());
  this.$el = null;
  this._mounted = false;
}

var prtt = Naive.prototype;

prtt.getState = function getState() {
  return this._store ? this._store.getState() : this._state;
};

prtt.test = function test() {
  var vdom = this._render(h, this.getState());
  if (vdom.length) {
    var docFragment = createDocumentFragment();
    for (var i = 0; i < vdom.length; ++i) {
      docFragment.appendChild(typeof vdom[i] === 'string' ? createTextNode(vdom[i]) : vdom[i].render());
    }
    document.body.appendChild(docFragment);
  } else {
    document.body.appendChild(vdom.render());
  }
  return this;
};

prtt.render = function render() {
  var _vdom = this._render(h, this.getState());
  var patches = diff(_vdom, this._vdom);
  applyPatch(patches);
};

prtt._init = function () {};

prtt.$mount = function (selector) {
  var replace = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;

  this.$el = getElement(selector) || createElement('div');
  var _dom = this._render(h).render();
  this.$el.appendChild(_dom);
  this._callHooks('ready');
};

prtt.$unmount = function () {
  removeNode(this.$el);
  this.$el = null;
};

prtt._callHooks = function callHooks(hookName) {
  var _callbacks = this._hooks[hookName] || [];
  for (var i = 0; i < _callbacks.length; ++i) {
    _callbacks[i].call(this);
  }
};

prtt._addHook = function addHook(hookName, callback) {
  var callbacks = this._hooks[hookName];
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

prtt._removeHook = function removeHook(hookName, callback) {
  var callbacks = this._hooks[hookName];
  if (!callbacks || callbacks.length === 0) {
    return this;
  }
  if (!callback) {
    callbacks.splice(0, callbacks.length);
  } else {
    for (var i = 0; i < callbacks.length; ++i) {
      if (callbacks[i] === callback) {
        callbacks.splice(i, 1);
        break;
      }
    }
  }
  return this;
};

prtt.$dispatch = function $dispatch(action) {};

var _templateHelpers = {
  each: function each(list) {
    var hList = [];
    for (var i = 0; i < list.length; ++i) {
      hList.push(h(list[i]));
    }
    return hList;
  },
  if: function _if(condition, vdom) {
    return condition ? h(vdom) : false;
  },
  _: function _() {}
};

// 组件
Naive.Component = function NaiveComponent(options) {
  var naive = new Naive({
    state: options.state,
    store: options.stote,
    render: function render(h$$1, state) {
      return options.render(h$$1, _templateHelpers, state);
    }
  });
  return naive;
};

module.exports = Naive;
//# sourceMappingURL=naive.js.map
