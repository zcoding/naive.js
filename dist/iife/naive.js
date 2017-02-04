var Naive = (function () {
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
  return typeof obj;
} : function (obj) {
  return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
};

function warn(message) {
  if (window.console) {
    console.warn('[naive.js] ' + message);
  }
}



var isArray = Array.isArray ? Array.isArray : function isArray(obj) {
  return Object.prototype.toString.call(obj) === '[object Array]';
};





function extend(obj, props) {
  if (props) {
    for (var i in props) {
      obj[i] = props[i];
    }
  }
  return obj;
}



function isFunction(obj) {
  return typeof obj === 'function';
}

function isPlainObject(obj) {
  return obj != null && (typeof obj === 'undefined' ? 'undefined' : _typeof(obj)) === 'object' && !isArray(obj) && Object.prototype.toString.call(obj) === '[object Object]';
}

 // asap async

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





function replaceNode(newNode, node) {
  node.parentNode.replaceChild(newNode, node);
}



function appendChild(el, target) {
  target.appendChild(el);
}

function setAttr(node, attr, value) {
  node.setAttribute(attr, value);
}

function VText(text) {
  this.data = text;
}

VText.prototype.render = function vdom2dom() {
  return createTextNode(this.data);
};

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
  var count = this.children.length;
  for (var _i = 0; _i < this.children.length; ++_i) {
    count += this.children[_i].count || 0;
  }
  this.count = count; // 记录子节点数，方便 patch 的时候找到节点位置
}

// 检查是否指令属性
function checkAttrDirective(attr) {
  return (/^@|n-|:/.test(attr)
  );
}

// add event listener
function isEventDirective(attr) {
  return (/^@/.test(attr)
  );
}

function attachEvent(el, eventName, handler) {
  if (el.addEventListener) {
    el.addEventListener(eventName, handler, false);
  } else if (el.attachEvent) {
    el.attachEvent(eventName, handler);
  } else {
    el['on' + eventName] = handler;
  }
}

VNode.prototype.render = function vdom2dom(context) {
  var el = createElement(this.tagName);
  var props = this.props;

  var _loop = function _loop(p) {
    if (checkAttrDirective(p)) {
      if (isEventDirective(p)) {
        var eventName = p.slice(1);
        attachEvent(el, eventName, function handler(evt) {
          props[p].call(context, evt);
        });
      } else {
        // 处理指令
      }
    } else {
      setAttr(el, p, props[p]);
    }
  };

  for (var p in props) {
    _loop(p);
  }
  for (var i = 0; i < this.children.length; ++i) {
    appendChild(this.children[i].render(context), el);
  }
  return el;
};

function isVNode(node) {
  return node instanceof VNode;
}

function isVText(node) {
  return node instanceof VText;
}

var PATCH = {
  REPLACE: 0, // 替换节点
  INSERT: 1, // 插入
  REMOVE: 2, // 移除
  REORDER: 3, // 重排
  PROPS: 4, // 修改属性
  TEXT: 5 // 替换文本
};

function patch(context, domNode, patches) {
  dfsWalk(context, domNode, 0, patches);
}

function dfsWalk(context, domNode, index, patches) {
  var currentPatches = patches[index];

  var len = domNode.childNodes ? domNode.childNodes.length : 0;
  for (var i = 0; i < len; i++) {
    var child = domNode.childNodes[i];
    index++;
    dfsWalk(context, child, index, patches);
  }
  if (currentPatches) {
    applyPatches(context, domNode, currentPatches);
  }
}

function patchReorder(context, domNode, moves) {
  for (var i = 0; i < moves.length; ++i) {
    var move = moves[i];
    switch (move.type) {
      case PATCH.INSERT:
        // 插入新节点
        var target = domNode.childNodes[move.index] || null; // null 插入末尾
        domNode.insertBefore(move.item.render(context), target);
        break;
      case PATCH.REMOVE:
        removeNode(domNode.childNodes[move.index]);
        break;
      default:
      // error type
    }
  }
}

// 检查是否指令属性
function isAttrDirective(attr) {
  return (/^@|n-|:/.test(attr)
  );
}
// 检查是否事件指令
function isEventDirective$1(attr) {
  return (/^@/.test(attr)
  );
}

function patchProps(domNode, patch) {
  for (var p in patch.props) {
    if (patch.props.hasOwnProperty(p)) {
      // 检查是否指令属性
      if (isAttrDirective(p)) {
        if (isEventDirective$1(p)) {
          // removeEventListener
          // addEventListener
        } else {// 其他指令属性
          }
      } else {
        // 普通属性
        setAttr(domNode, p, patch.props[p]);
      }
    }
  }
}

// 根据补丁更新 DOM 节点
function applyPatches(context, domNode, patches) {
  for (var i = 0; i < patches.length; ++i) {
    var _patch = patches[i];
    switch (_patch.type) {
      case PATCH.REPLACE:
        // 替换元素节点
        replaceNode(_patch.node.render(context), domNode);
        break;
      case PATCH.PROPS:
        // 属性修改
        patchProps(domNode, _patch);
        break;
      case PATCH.TEXT:
        // 替换文本内容
        domNode.data = _patch.data;
        break;
      case PATCH.REORDER:
        // 子节点重新排序
        patchReorder(context, domNode, _patch.moves);
        break;
      default:
      // warn
    }
  }
}

function makeKeyIndexAndFree(list) {
  var keyIndex = {}; // 有 key 的节点位置
  var free = []; // 可替换的位置（没有 key 的节点都被标识为可替换的节点）
  for (var i = 0, len = list.length; i < len; i++) {
    var item = list[i];
    var itemKey = item.key;
    if (itemKey) {
      keyIndex[itemKey] = i;
    } else {
      free.push(item);
    }
  }
  return {
    keyIndex: keyIndex,
    free: free
  };
}

function listDiff(pList, nList) {
  var nMap = makeKeyIndexAndFree(nList);
  var nKeys = nMap.keyIndex,
      nFree = nMap.free;
  var pMap = makeKeyIndexAndFree(pList);
  var pKeys = pMap.keyIndex,
      pFree = pMap.free;
  // 先处理有 key 的元素，看其在 nList 还是否存在，如果不存在说明被移除
  var children = [];
  for (var _i = 0, freeIndex = 0; _i < pList.length; ++_i) {
    var item = pList[_i];
    var itemKey = item.key;
    if (itemKey) {
      if (!nKeys.hasOwnProperty(itemKey)) {
        children.push(null);
      } else {
        var itemKeyIndex = nKeys[itemKey];
        children.push(nList[itemKeyIndex]);
      }
    } else {
      children.push(nFree[freeIndex++] || null);
    }
  }
  var moves = [];
  function remove(index) {
    moves.push({
      type: PATCH.REMOVE,
      index: index
    });
  }
  function insert(index, item) {
    moves.push({
      type: PATCH.INSERT,
      index: index,
      item: item
    });
  }
  var simulateList = children.slice(0);
  // 找出被移除的节点
  var i = 0;
  while (i < simulateList.length) {
    if (simulateList[i] === null) {
      remove(i);
      simulateList.splice(i, 1);
    } else {
      ++i;
    }
  }
  // 遍历 nList
  for (var s = 0, n = 0; n < nList.length; ++n) {
    var nItem = nList[n];
    var nItemKey = nItem.key;
    var sItem = simulateList[s];
    if (sItem) {
      var sItemKey = sItem.key;
      if (sItemKey === nItemKey) {
        // 相同元素相同位置
        s++;
      } else {
        if (!pKeys.hasOwnProperty(nItemKey)) {
          // 旧列表中不存在，新节点
          insert(n, nItem); // 在位置 n 插入新节点 nItem
        } else {// 旧列表中存在，需要移位（移位操作包括删除和插入两者中的一个或两个）
          }
      }
    } else {
      // 旧列表该位置为空，直接插入
      insert(n, nItem);
    }
  }
  return {
    moves: moves,
    children: children
  };
}

function diff(oldTree, newTree) {
  var index = 0;
  var patches = {};
  diffWalk(oldTree, newTree, index, patches);
  return patches;
}

function diffWalk(pNode, nNode, index, patches) {
  var currentPatches = []; // 当前层级的 patch
  if (nNode === null) {
    // 这种情况属于：在 diffChildren 的时候该节点被标识为被删除的节点，但是不需要在这里删除（在 reorder 的时候会处理删除）
  } else if (isVNode(pNode) && isVNode(nNode)) {
    // 都是 VNode
    if (pNode.tagName !== nNode.tagName || pNode.key !== nNode.key) {
      // 不同节点，或者已标识不是同一节点，要替换
      currentPatches.push({ type: PATCH.REPLACE, node: nNode });
    } else {
      var propsPatches = diffProps(pNode, nNode);
      if (propsPatches) {
        currentPatches.push({ type: PATCH.PROPS, props: propsPatches });
      }
      // 继续 diff 子节点
      diffChildren(pNode.children, nNode.children, index, patches, currentPatches);
    }
  } else if (isVText(pNode) && isVText(nNode)) {
    // 都是 VText
    if (pNode.data !== nNode.data) {
      // 内容不一样的时候才替换（只替换内容即可）
      currentPatches.push({ type: PATCH.TEXT, data: nNode.data });
    }
  } else {
    // 类型不一样，绝对要替换
    currentPatches.push({ type: PATCH.REPLACE, node: nNode });
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

function diffChildren(pChildNodes, nChildNodes, index, patches, currentPatches) {
  var diffs = listDiff(pChildNodes, nChildNodes, index, patches);
  var newChildren = diffs.children;

  if (diffs.moves.length) {
    // 需要 reorder
    // reorder 的操作在父节点执行，所以应该加到父节点的 patch
    var reorderPatch = { type: PATCH.REORDER, moves: diffs.moves };
    currentPatches.push(reorderPatch);
  }

  // 除了重排的 patch 还有各个子节点自身的 patch
  var leftNode = null;
  var currentNodeIndex = index;
  for (var i = 0; i < pChildNodes.length; ++i) {
    currentNodeIndex = leftNode && leftNode.count ? currentNodeIndex + leftNode.count + 1 : currentNodeIndex + 1;
    diffWalk(pChildNodes[i], newChildren[i], currentNodeIndex, patches);
    leftNode = pChildNodes[i];
  }
}

function h(tagName, props, children) {
  return new VNode(tagName, props, children);
}

/**
 * 双向链表实现的使用 LRU 算法的缓存
 * 缓存最近最常用的项目，当缓存满时丢弃最近最少用的项目
 *
 * @param {Number} 缓存最大限制
 * @constructor
 */

function Cache(limit) {
  this.size = 0; // 缓存大小
  this.limit = limit; // 缓存大小最大限制
  this.head = this.tail = undefined; // 头尾指针
  this._keymap = Object.create(null); // 缓存映射表
}

var p = Cache.prototype;

/**
 * 将 <key> <value> 键值对存储到缓存映射表
 * 如果缓存满了，删除一个节点让出空间给新的缓存，并返回被删的节点
 * 否则返回 undefined
 *
 * @param {String} 键
 * @param {*} 值
 * @return {Entry|undefined}
 */

p.put = function (key, value) {
  var removed;

  var entry = this.get(key, true); // 先查看是否已经有缓存，如果有，只需要更新它的 value 就可以了
  if (!entry) {
    if (this.size === this.limit) {
      // 缓存满了
      removed = this.shift();
    }
    entry = {
      key: key
    };
    this._keymap[key] = entry;
    if (this.tail) {
      this.tail.newer = entry;
      entry.older = this.tail;
    } else {
      this.head = entry;
    }
    this.tail = entry; // 将这个项目作为最新的插入缓存
    this.size++;
  }
  entry.value = value;

  return removed;
};

/**
 * 从缓存中清除最近最少使用（放得最久的）项目
 * 返回被清除的项目，如果缓存为空就返回 undefined
 */

p.shift = function () {
  var entry = this.head;
  if (entry) {
    this.head = this.head.newer; // 头部的是最旧的，所以要从头部开始清除
    this.head.older = undefined;
    entry.newer = entry.older = undefined;
    this._keymap[entry.key] = undefined;
    this.size--;
  }
  return entry;
};

/**
 * 获取并且注册最近使用的 <key>
 * 返回 <key> 对应的值
 * 如果缓存中找不到这个 <key> 就返回 undefined
 *
 * @param {String} 键
 * @param {Boolean} 是否返回整个 entry ，如果为 false 则只返回 value
 * @return {Entry|*} 返回 Entry 或者它的值，或者 undefined
 */

p.get = function (key, returnEntry) {
  var entry = this._keymap[key];
  if (entry === undefined) return; // 缓存不存在，直接返回 undefined
  if (entry === this.tail) {
    // 缓存是最新的，直接返回这个缓存项（或者它的值）
    return returnEntry ? entry : entry.value;
  }
  // HEAD--------------TAIL
  //   <.older   .newer>
  //  <--- add direction --
  //   A  B  C  <D>  E
  if (entry.newer) {
    // 如果缓存不是最新的
    if (entry === this.head) {
      // 如果缓存是最旧的
      this.head = entry.newer; // 将比它新的作为最旧的
    }
    entry.newer.older = entry.older; // C <-- E. 将它的后一个作为前一个的最旧
  }
  if (entry.older) {
    // 如果有比它更旧的
    entry.older.newer = entry.newer; // C. --> E 将它的前一个作为后一个的最新
  }
  entry.newer = undefined; // D --x // 它本身没有更新的
  entry.older = this.tail; // D. --> E
  if (this.tail) {
    this.tail.newer = entry; // E. <-- D
  }
  this.tail = entry; // 将自己作为最新的
  return returnEntry ? entry : entry.value;
};

var pathCache = new Cache(1000);



var restoreRE = /"(\d+)"/g;
var saved = [];

function restore(str, i) {
  return saved[i];
}

/**
 * 解析一个表达式
 * @param {String} expression 表达式字符串
 * @param {String} scope 作用域限制
 * @return {Function} 一个函数，用来返回表达式的值
 */




/**
 * parsePath 解析取值路径，返回真正的值，如果找不到，返回 undefined
 *
 * @param {Object} data
 * @param {String} path
 * @return {*} value
 * @throw {Error} 不合法的路径
 *
 * @example
 * parsePath('a.b.c') === ['a', 'b', 'c']
 */
function parsePath(path) {
  var hit = pathCache.get(path);
  if (hit) {
    return hit;
  }
  // data.a.b.c 👍
  // data.a["b"].c 👍
  // data["a"]["b"]["c"] 👍
  // data.a["b.c"] 👍
  // data["a.b.c"] 👍
  // data.a[b] 👎
  // data.a[b.c] 👎
  var parts = path.split(/\[|\]/g),
      i = 0;
  var props = [];
  while (i < parts.length) {
    var match1 = /^(\.)?[^\'\"\.\s]+(\.[^\'\"\.\s]+)*$/.test(parts[i]);
    var match2 = /(^\s*\'.+\'\s*$)|(^\s*\".+\"\s*$)|(^\s*$)/.test(parts[i]);
    if (!(match1 || match2)) {
      throw new Error("不合法的路径: " + path);
    }
    if (match1) {
      var _props = parts[i].split('.'),
          j = 0;
      while (j < _props.length) {
        if (_props[j] === '') {
          if (i !== 0) {
            j++;
            continue;
          } else {
            throw new Error("不合法的路径: " + path);
          }
        } else {
          props.push(_props[j]);
        }
        j++;
      }
    } else {
      // match2
      if (!/^\s*$/.test(parts[i])) {
        var _prop = parts[i].replace(/^\s*[\"\']|[\'\"]\s*$/g, '');
        props.push(_prop);
      }
    }
    i++;
  }
  pathCache.put(path, props);
  return props;
}

function addHook(hookName, callback) {
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
}

function removeHook(hookName, callback) {
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
}

function callHooks(hookName) {
  var _callbacks = this._hooks[hookName] || [];
  for (var i = 0; i < _callbacks.length; ++i) {
    _callbacks[i].call(this);
  }
}

function NaiveException(message) {
  this.name = 'NaiveException';
  this.message = message;
}

function Naive(options) {
  options = options || {};
  this._hooks = {};
  if (!isFunction(options.state)) {
    // 必须是 function
    throw new NaiveException('state 必须是 Function');
  }
  var _state = options.state();
  if (isPlainObject(_state)) {
    this.state = _state;
  } else {
    warn('state 必须是 plain object');
    this.state = {};
  }
  this.render = function render() {
    return options.render.call(this, h);
  };
  this.ele = null;
  this._init(options);
}

Naive.createElement = h;

var prtt = Naive.prototype;

prtt.setState = function setState(state) {
  extend(this.state, state);
  this.update();
  return this;
};

// 更新视图
prtt.update = function update() {
  if (!this.mounted) {
    // 如果组件没有挂载到元素上，不需要更新视图
    return this;
  }
  var preVdom = this.vdom;
  this.vdom = this.render();
  // console.log(preVdom, this.vdom);
  var patches = diff(preVdom, this.vdom);
  console.log(patches);
  if (patches) {
    patch(this, this.ele, patches);
  } else {
    warn('不需要更新视图');
  }
};

prtt._init = function _init(options) {
  var methods = options.methods || {};
  // 将 methods 移到 this
  for (var m in methods) {
    if (methods.hasOwnProperty(m)) {
      if (this.hasOwnProperty(m)) {
        warn('\u5C5E\u6027 "' + m + '" \u5DF2\u5B58\u5728');
      } else {
        this[m] = methods[m];
      }
    }
  }
  var hooks = options.hooks || {};
  for (var p in hooks) {
    if (hooks.hasOwnProperty(p)) {
      this._addHook(p, hooks[p]);
    }
  }
  this.vdom = this.render();
};

prtt.mount = function mount(selector) {
  var mountPoint = getElement(selector);
  if (!mountPoint) {
    throw new NaiveException('找不到挂载节点');
  }
  var vdom = this.vdom;
  if (vdom.length) {
    // fragment
    var docFragment = createDocumentFragment();
    for (var i = 0; i < vdom.length; ++i) {
      appendChild(typeof vdom[i] === 'string' ? createTextNode(vdom[i]) : vdom[i].render(this), docFragment);
    }
    this.ele = docFragment;
  } else {
    this.ele = vdom.render(this);
  }
  replaceNode(this.ele, mountPoint);
  this.mounted = true;
  this._callHooks('mounted');
};

prtt._callHooks = callHooks;

prtt._addHook = addHook;

prtt._removeHook = removeHook;

// 销毁组件
prtt.destroy = function destroy() {
  // 销毁事件监听
  // 调用 destroy 勾子
  this._callHooks('destroy');
  // 销毁勾子回调
  for (var p in this._hooks) {
    if (this._hooks.hasOwnProperty(p)) {
      this._removeHook(p);
    }
  }
};

return Naive;

}());
//# sourceMappingURL=naive.js.map
