define('naive', function () { 'use strict';

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

function isUndefined(obj) {
  return typeof obj === 'undefined';
}



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
  var parentNode = node.parentNode;
  if (parentNode) {
    parentNode.removeChild(node);
  }
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



function removeAttr(node, name) {
  node.removeAttribute(name);
}



var supportClassList = !isUndefined(document.createElement('div').classList);

var hasClass = supportClassList ? function (element, classes) {
  classes = classes.split(/\s+/).filter(function (s) {
    return s;
  });
  var contains = true;
  for (var i = 0; i < classes.length; ++i) {
    if (!element.classList.contains(classes[i])) {
      contains = false;
      break;
    }
  }
  return contains;
} : function (element, classes) {
  classes = classes.split(/\s+/).filter(function (s) {
    return s;
  });
  var contains = true,
      tmp = element.className;
  for (var i = 0; i < classes.length; ++i) {
    if (tmp.indexOf(classes[i]) === -1) {
      contains = false;
      break;
    }
  }
  return contains;
};

var addClass = supportClassList ? function (element, classes) {
  classes = classes.split(/\s+/).filter(function (s) {
    return s;
  });
  element.classList.add.apply(element.classList, classes);
  return element;
} : function (element, classes) {
  var tmp = element.className;
  classes = classes.split(/\s+/).filter(function (s) {
    return s;
  });
  classes.forEach(function (c) {
    if (!hasClass(element, c)) {
      tmp = tmp.replace(/\s+|$/, ' ' + classes);
    }
  });
  element.className = tmp;
  return element;
};

var removeClass = supportClassList ? function (element, classes) {
  classes = classes.split(/\s+/).filter(function (s) {
    return s;
  });
  element.classList.remove.apply(element.classList, classes);
  return element;
} : function (element, classes) {
  var tmp = element.className;
  classes = classes.split(/\s+/).filter(function (s) {
    return s;
  });
  classes.forEach(function (c) {
    if (hasClass(element, c)) {
      tmp = tmp.replace(new RegExp(c, 'g'), '');
    }
  });
  element.className = tmp;
  return element;
};

function VText(text) {
  this.data = text;
}

VText.prototype.render = function vdom2dom() {
  return createTextNode(this.data);
};

function klass(setValue, element, context) {
  if (typeof setValue === 'string') {
    setAttr(element, 'class', setValue);
  } else if (isArray(setValue)) {
    setAttr(element, 'class', setValue.join(' '));
  } else {
    for (var c in setValue) {
      if (setValue.hasOwnProperty(c)) {
        if (setValue[c]) {
          addClass(element, c);
        } else {
          removeClass(element, c);
        }
      }
    }
  }
}

function show(value, element, context) {
  element.style.display = value ? '' : 'none';
}

function style(value, element, context) {
  for (var s in value) {
    element.style[s] = value[s];
  }
}

function handleDirective(directive, value, element, context) {
  switch (directive) {
    case 'show':
      show(value, element, context);
      break;
    case 'class':
      klass(value, element, context);
      break;
    case 'style':
      style(value, element, context);
      break;
    default:
      setAttr(element, directive, value);
      break;
  }
}

function removeClassAttr(removeValue, element, context) {
  if (typeof removeValue === 'string') {
    removeClass(element, removeValue);
  } else if (isArray(removeValue)) {
    removeClass(element, removeValue.join(' '));
  } else {
    for (var c in removeValue) {
      if (removeValue.hasOwnProperty(c)) {
        removeClass(element, c);
      }
    }
  }
}

function handleDirectiveRemove(directive, value, element, context) {
  switch (directive) {
    case 'class':
      removeClassAttr(value, element, context);
      break;
  }
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

function VNode(tagName, props, children, key) {
  this.tagName = tagName;
  this.props = props || {};
  this.key = key ? String(key) : undefined; // key 用来标识节点，方便 diff
  var childNodes = [];
  children = children || [];
  for (var i = 0; i < children.length; ++i) {
    var child = children[i];
    if (isVNode(child) || isVText(child) || child._isComponent) {
      childNodes.push(child);
    } else if (typeof child === 'string' || typeof child === 'number') {
      childNodes.push(new VText(child));
    } else if (isArray(child)) {
      childNodes = childNodes.concat(child);
    } else {
      // ignore
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
VNode.prototype.render = function vdom2dom(context) {
  var el = createElement(this.tagName);
  var props = this.props;
  for (var p in props) {
    if (checkAttrDirective(p)) {
      // 处理指令
      if (/^n-/.test(p)) {
        handleDirective(p.slice(2), props[p], el, context);
      } else if (/^:/.test(p)) {
        handleDirective(p.slice(1), props[p], el, context);
      } else {
        (function () {
          var eventName = p.slice(1);
          var handlerFunc = isFunction(props[p]) ? props[p] : context[props[p]];
          attachEvent(el, eventName, function handler(evt) {
            handlerFunc.call(context, evt);
          });
        })();
      }
    } else {
      setAttr(el, p, props[p]);
    }
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
  var walker = { index: 0 };
  dfsWalk(context, domNode, walker, patches);
}

function dfsWalk(context, domNode, walker, patches) {
  var currentPatches = patches[walker.index];

  var len = domNode.childNodes ? domNode.childNodes.length : 0;
  for (var i = 0; i < len; i++) {
    var child = domNode.childNodes[i];
    walker.index++;
    dfsWalk(context, child, walker, patches);
  }
  if (currentPatches) {
    applyPatches(context, domNode, currentPatches);
  }
}

// @TODO 重用 dom 节点
function patchReorder(context, domNode, moves) {
  // console.log(moves);
  var keyMap = {};
  for (var i = 0; i < moves.length; ++i) {
    var move = moves[i];
    switch (move.type) {
      case PATCH.INSERT:
        // 插入新节点
        var target = domNode.childNodes[move.index] || null; // null 插入末尾
        var toInsert = typeof move.item.key !== 'undefined' && keyMap[move.item.key] || move.item.render(context);
        domNode.insertBefore(toInsert, target);
        break;
      case PATCH.REMOVE:
        var toRemove = domNode.childNodes[move.index];
        if (typeof move.key !== 'undefined') {
          keyMap[move.key] = toRemove;
        }
        // console.log(toRemove);
        removeNode(toRemove);
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
function patchProps(domNode, patch, context) {
  for (var p in patch.props) {
    if (patch.props.hasOwnProperty(p)) {
      // 检查是否指令属性
      if (isAttrDirective(p)) {
        // 处理指令
        if (/^n-/.test(p)) {
          handleDirective(p.slice(2), patch.props[p], domNode, context);
        } else if (/^:/.test(p)) {
          handleDirective(p.slice(1), patch.props[p], domNode, context);
        } else {
          // 事件指令
          // remove old event listener
          // detachEvent(domNode, p.slice(1), patch.props[p]);
          // add new event listener
        }
      } else {
        // 普通属性
        if (typeof patch.props[p] === 'undefined') {
          removeAttr(domNode, p);
        } else {
          setAttr(domNode, p, patch.props[p]);
        }
      }
    }
  }
  // @TODO remove 错误
  for (var _p in patch.removeProps) {
    if (patch.removeProps.hasOwnProperty(_p)) {
      if (isAttrDirective(_p)) {
        if (/^n-/.test(_p)) {} else if (/^:/.test(_p)) {
          handleDirectiveRemove(_p.slice(1), patch.removeProps[_p], domNode, context);
        } else {}
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
        patchProps(domNode, _patch, context);
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

  // rList 数组保存的是 nList 的节点，根据 key 找到 pList 中的对应节点并按照 pList 中节点的顺序排列，这样就可以在 diffChildren 的时候按顺序一一比较
  // 在“重排”的过程中，记录实现 nList 的节点顺序的重排操作，保存在 moves 中，这样在 patch 的时候就可以找到对应的 dom
  var rList = [];

  // 找 pList 中有 key 的节点的对应节点
  for (var i = 0, freeIndex = 0; i < pList.length; ++i) {
    var item = pList[i];
    var itemKey = item.key;
    if (itemKey) {
      if (!nKeys.hasOwnProperty(itemKey)) {
        // 如果 pList 有但 nList 没有，说明该节点一定会被删掉
        rList.push(null);
      } else {
        // 有对应节点
        var itemKeyIndex = nKeys[itemKey];
        rList.push(nList[itemKeyIndex]);
      }
    } else {
      // 如果该节点没有 key 就在 nList 中也找一个没有 key 的节点（空闲节点）来填这个位置（按照顺序取），如果 nList 已经没有“空闲节点”，那么这个节点一定会被删掉
      rList.push(nFree[freeIndex++] || null);
    }
  }
  var moves = [];
  function remove(index, key) {
    moves.push({
      type: PATCH.REMOVE,
      index: index,
      key: key
    });
  }
  function insert(index, item) {
    moves.push({
      type: PATCH.INSERT,
      index: index,
      item: item
    });
  }
  // rList 已经处理完，开始模拟 reorder 操作，找出实际 reorder 的操作步骤
  // simulateList 用来模拟 reorder 过程中的 pList
  var simulateList = rList.slice(0);
  // 找出 pList 中被移除的节点（前面已经标识为 null 的节点）
  for (var _i = 0; _i < simulateList.length;) {
    if (simulateList[_i] === null) {
      remove(_i);
      simulateList.splice(_i, 1);
    } else {
      ++_i;
    }
  }
  // 遍历 nList 安排其他节点，包括没有被删的节点（有 key 对应的节点）、nList 中有 pList 中没有的节点
  for (var s = 0, n = 0; n < nList.length; ++n) {
    var nItem = nList[n];
    var nItemKey = nItem.key;
    var sItem = simulateList[s];
    if (sItem) {
      // 已经超出 simulateList 范围，剩余的节点都插入
      var sItemKey = sItem.key;
      if (sItemKey === nItemKey) {
        // 位置相同，不需要 reorder 包括没有 key 的也不需要 reorder
        ++s;
      } else {
        if (typeof nItemKey !== 'undefined' && !pKeys.hasOwnProperty(nItemKey)) {
          // 旧列表中不存在，新节点直接插入
          insert(n, nItem);
        } else {
          // 旧列表中存在，需要对 sItem 和 nItem 进行对调
          var nextSItem = simulateList[s + 1];
          if (nextSItem && nextSItem.key === nItemKey) {
            remove(n, sItemKey);
            simulateList.splice(s, 1);
            ++s;
          } else {
            insert(n, nItem);
            if (n === nList.length - 1) {
              remove(n + 1, sItemKey);
            }
          }
        }
      }
    } else {
      // 旧列表该位置为空，直接插入
      insert(n, nItem);
    }
  }
  // console.log(moves)
  return {
    moves: moves,
    rList: rList
  };
}

// 分别找到有 key 的元素位置和没有 key 的元素的位置


// reorder:
// [f1, A, B, C, D, f2] => [f3, C, B, A, f4, E, f5]
// rList: [f3, A, B, C, null, f4]
// rList: [f3, A, B, C, null, f4, E, f5]
// deletedItems: 1
// simulateList: [f3, A, B, C, null, f4, E, f5]
// nList:        [f3, C, B, A, f4,   E,  f5   ]
// si:0, k:0, nItem:f3, sItem:f3
// s1:1, k:1, nItem:C, sItem:A
// remove(1, A) => simulateList:[f3, B, C, null, f4, E, f5], sItem:B
// insert(1, C) k++
// si:1, k:2, nItem:B, sItem:B
// si:2, k:3, nItem:A, sItem:C
// remove(2, C) => simulateList:[f3, B, null, f4, E, f5], sItem:null
// insert(3, A) k++
// si:2, k:4, nItem:f4, sItem:null
// remove(2, null) => simulateList:[f3, B, f4, E, f5], sItem:f4
// si:2, k:4, nItem:f4, sItem:f4 => si++, k++
// si:3, k:5, nItem:E, sItem:E => si++, k++
// si:4, k:6, nItem:f5, sItem:f5 => si++, k++
// si:5, k:7
// moves:{removes: [(1, A), (2, C), (2, null)], inserts: [(1, C), (3, A)]}

// diffChildren:
// pList: [f1, A1, B1, C1, D,    f2       ]
// rList: [f3, A2, B2, C2, null, f4, E, f5]
// diff(f1, f3)
// diff(A1, A2)
// diff(B1, B2)
// diff(C1, C2)
// diff(D, null) => remove(D)
// diff(f2, f4)
// insert(null, E)
// insert(null, f5)
// {order: moves}

// patch:
// 目标: [f3, C2, B2, A2, f4, E, f5]
// 先 patch 子节点:
// patch(f1, f3)
// patch(A1, A2)
// patch(B1, B2)
// patch(C1, C2)
// remove D
// patch(f2, f4)
// [f1, A1, B1, C1, D, f2]=> [f3, A2, B2, C2, f4]
// patch order:
// insert(null, E) => [f3, A2, B2, C2, f4, E]
// insert(null, f5) => [f3, A2, B2, C2, f4, E, f5]
// remove(1, A) => [f3, B2, C2, f4, E, f5], map:{A: A2}
// remove(2, C) => [f3, B2, f4, E, f5], map:{A: A2, C: C2}
// remove(2, null) => [f1, B1, f2, E, f5]
// insert(1, C) => [f1, C1, B1, f2, E, f5]
// insert(3, A) => [f1, C1, B1, A1, f2, E, f5]

function diff(oldTree, newTree) {
  var index = 0;
  var patches = {};
  if (isArray(oldTree)) {
    var currentPatches = [];
    diffChildren(oldTree, newTree, 0, patches, currentPatches);
    if (currentPatches.length) {
      patches[0] = currentPatches;
    }
  } else {
    diffWalk(oldTree, newTree, index, patches);
  }
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
        currentPatches.push({ type: PATCH.PROPS, props: propsPatches.set, removeProps: propsPatches.remove });
      }
      // 继续 diff 子节点
      diffChildren(pNode.children, nNode.children, index, patches, currentPatches);
      // const _r = listDiff2(pNode.children, nNode.children);
      // console.log(_r);
    }
  } else if (isVText(pNode) && isVText(nNode)) {
    // 都是 VText
    if (pNode.data !== nNode.data) {
      // 内容不一样的时候才替换（只替换内容即可）
      currentPatches.push({ type: PATCH.TEXT, data: nNode.data });
    }
  } else if (pNode._isComponent || nNode._isComponent) {// 组件
    // console.log('component');
  } else {
    // 类型不一样，绝对要替换
    currentPatches.push({ type: PATCH.REPLACE, node: nNode });
  }
  if (currentPatches.length) {
    patches[index] = currentPatches;
  }
}

// 快速比较两个对象是否“相等”
function objectEquals(a, b) {
  return JSON.stringify(a) === JSON.stringify(b);
}

function diffProps(oldTree, newTree) {
  var oldTreeProps = oldTree.props;
  var newTreeProps = newTree.props;
  var setPropsPatches = {},
      removePropsPatches = {},
      hasPatch = false;
  for (var p in oldTreeProps) {
    if (!newTreeProps.hasOwnProperty(p) || typeof newTreeProps[p] === 'undefined') {
      // 属性被移除
      hasPatch = true;
      removePropsPatches[p] = oldTreeProps[p];
    } else if (isPlainObject(newTreeProps[p])) {
      if (!objectEquals(newTreeProps[p], oldTreeProps[p])) {
        hasPatch = true;
        setPropsPatches[p] = newTreeProps[p];
      }
    } else if (newTreeProps[p] !== oldTreeProps[p]) {
      hasPatch = true;
      setPropsPatches[p] = newTreeProps[p];
    }
  }
  // 检查新属性
  for (var _p in newTree) {
    if (newTree.hasOwnProperty(_p) && !oldTree.hasOwnProperty(_p)) {
      hasPatch = true;
      setPropsPatches[_p] = newTreeProps[_p];
    }
  }
  if (!hasPatch) {
    return null;
  }
  return {
    set: setPropsPatches,
    remove: removePropsPatches
  };
}

function diffChildren(pChildNodes, nChildNodes, index, patches, currentPatches) {
  var diffs = listDiff(pChildNodes, nChildNodes, index, patches);
  var reorderChildNodes = diffs.rList;

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
    diffWalk(pChildNodes[i], reorderChildNodes[i], currentNodeIndex, patches);
    leftNode = pChildNodes[i];
  }
}

// 按照先删除后插入的顺序

function h(tagName, props, children, key) {
  var context = this || {};
  var components = context['components'] || {};
  if (isVNode(tagName) || isVText(tagName)) {
    return tagName;
  } else if (isPlainObject(tagName)) {
    if (components.hasOwnProperty(tagName.tagName)) {
      console.log(tagName.tagName);
    }
    return new VNode(tagName.tagName, tagName.attrs, tagName.children, tagName.key);
  } else if (isArray(tagName)) {
    var list = [];
    for (var i = 0; i < tagName.length; ++i) {
      list.push(h(tagName[i]));
    }
    return list;
  } else if (arguments.length < 2) {
    return new VText(tagName);
  } else {
    if (components.hasOwnProperty(tagName)) {
      return components[tagName]();
    } else {
      return new VNode(tagName, props, children, key);
    }
  }
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

function emptyRender() {
  return null;
}

function Naive(options) {
  options = options || {};
  this.name = options.name || '';
  this._hooks = {};
  this._isComponent = true;
  if ('state' in options) {
    if (!isFunction(options.state)) {
      // 必须是 function
      throw new NaiveException('state 必须是 [Function]');
    }
    var _state = options.state();
    if (isPlainObject(_state)) {
      this.state = _state;
    } else {
      warn('state 必须返回 [Plain Object]');
      this.state = {};
    }
  } else {
    this.state = {};
  }
  var context = this;
  var _vdomRender = options.render || emptyRender;
  var _templateHelpers = {
    "if": function _if(condition, options) {
      return condition ? h(options) : condition;
    },
    "each": function each(list, createItem) {
      var nodes = [];
      for (var i = 0; i < list.length; ++i) {
        var item = list[i];
        var key = isPlainObject(item) && 'id' in item ? item['id'] : i;
        nodes.push(h(createItem.call(context, item, i, key)));
      }
      return nodes;
    }
  };
  this.vdomRender = function vdomRender() {
    return _vdomRender.call(this, function createVdom() {
      return h.apply(context, Array.prototype.slice.call(arguments, 0));
    }, _templateHelpers);
  };
  this.ele = null;
  // components
  this.components = {};
  var componentsOptions = options.components || {};
  for (var p in componentsOptions) {
    if (componentsOptions.hasOwnProperty(p)) {
      var componentDefine = componentsOptions[p] || {};
      componentDefine.name = componentDefine.name || p;
      context.components[p] = createComponentCreator(this, componentDefine);
    }
  }
  this._init(options);
}

function createComponentCreator(context, componentDefine) {
  return function createComponent() {
    return new Naive(componentDefine);
  };
}

var prtt = Naive.prototype;

prtt.render = function render() {
  var vdom = this.vdom;
  if (vdom.length) {
    // fragment
    var docFragment = createDocumentFragment();
    var simFragment = { childNodes: [] };
    for (var i = 0; i < vdom.length; ++i) {
      var node = vdom[i].render(this);
      simFragment.childNodes.push(node);
      appendChild(node, docFragment);
    }
    this.ele = simFragment;
    return docFragment;
  } else {
    this.ele = vdom.render(this);
    return this.ele;
  }
};

prtt.setState = function setState(state) {
  extend(this.state, state);
  this.update(); // @TODO nextTick 的时候再 update
  return this;
};

// 更新视图
prtt.update = function update() {
  if (!this.mounted) {
    // 如果组件没有挂载到元素上，不需要更新视图
    return this;
  }
  var preVdom = this.vdom;
  this.vdom = this.vdomRender();
  // console.log(preVdom, this.vdom);
  var patches = diff(preVdom, this.vdom);
  // console.log(patches);
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
  this.vdom = this.vdomRender();
};

prtt.mount = function mount(selector) {
  var mountPoint = typeof selector === 'string' ? getElement(selector) : selector;
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

});
//# sourceMappingURL=naive.js.map
