var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
  return typeof obj;
} : function (obj) {
  return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
};

var sliceArray = Array.prototype.slice;

function warn(message) {
  if (window.console) {
    console.warn('[naive.js] ' + message);
  }
}



var isArray = Array.isArray || function isArray(arr) {
  return Object.prototype.toString.call(arr) === '[obejct Array]';
};

function toArray$$1(obj) {
  return sliceArray.call(obj, 0);
}

function isUndefined(obj) {
  return void 0 === obj;
}



function isObject(obj) {
  return 'object' === (typeof obj === 'undefined' ? 'undefined' : _typeof(obj));
}

function deepClone(obj) {
  return deepExtend({}, obj);
}



// IE8
function isFunction(obj) {
  return 'function' === typeof obj;
}

function isString(obj) {
  return 'string' === typeof obj;
}

function plainObject() {
  return {};
}

function hasOwnProp() {
  return plainObject().hasOwnProperty;
}

// IE8+
function isPlainObject(obj) {
  if (!obj || Object.prototype.toString.call(obj) !== '[object Object]') {
    return false;
  }

  var proto = Object.getPrototypeOf(obj);

  if (!proto) {
    return true;
  }

  var Ctor = hasOwnProp.call(proto, 'constructor') && proto.constructor;
  return typeof Ctor === 'function' && hasOwnProp.toString.call(Ctor) === hasOwnProp.toString.call(Object);
}

// IE8+
function deepExtend() {
  var options, name, src, copy, copyIsArray, clone;
  var target = arguments[0] || {};
  var length = arguments.length;

  if (!isObject(target) && !isFunction(target)) {
    target = {};
  }

  for (var i = 1; i < length; i++) {
    if ((options = arguments[i]) != null) {

      if (isString(options)) {
        continue;
      }

      for (name in options) {
        src = target[name];
        copy = options[name];

        // 防止循环引用
        if (target === copy) {
          continue;
        }

        // Recurse if we're merging plain objects or arrays
        if (copy && (isPlainObject(copy) || (copyIsArray = isArray(copy)))) {

          if (copyIsArray) {
            copyIsArray = false;
            clone = src && isArray(src) ? src : [];
          } else {
            clone = src && isPlainObject(src) ? src : {};
          }

          // Never move original objects, clone them
          target[name] = deepExtend(clone, copy);
          target[name] = deepExtend(clone, copy);

          // Don't bring in undefined values
        } else if (copy !== undefined) {
          target[name] = copy;
        }
      }
    }
  }

  // Return the modified object
  return target;
}

function simpleExtend(dest, src) {
  if (!isPlainObject(src)) {
    return dest;
  }
  for (var p in dest) {
    if (dest.hasOwnProperty(p)) {
      if (!isUndefined(src[p])) {
        dest[p] = src[p];
      }
    }
  }
  return dest;
}

function getElement(selector) {
  if (isString(selector)) {
    if (selector[0] === '#') {
      return document.getElementById(selector.slice(1));
    } else {
      return query(selector);
    }
  } else {
    return selector;
  }
}

function createElement(tag) {
  return document.createElement(tag);
}

function createTextNode(text) {
  return document.createTextNode(text);
}



function query(selector, context) {
  context = context || document;
  return context.querySelector(selector);
}

/**
 * 检查一个元素是否在 document 内
 */


function removeNode(node) {
  var parentNode = node ? node.parentNode : null;
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

var NodeTypes = {
  "VNODE": 1,
  "1": "VNODE",
  "VTEXT": 2,
  "2": "VTEXT",
  "VCOMPONENT": 3,
  "3": "VCOMPONENT"
};

function isVNode(node) {
  return node.nodeType === NodeTypes['VNODE'];
}

function isVText(node) {
  return node.nodeType === NodeTypes['VTEXT'];
}

function isVComponent(node) {
  return node.nodeType === NodeTypes['VCOMPONENT'];
}

function keyIndex(list) {
  var keys = {}; // 有 key 的节点位置
  var free = []; // 可替换的位置（没有 key 的节点都被标识为可替换的节点）
  for (var i = 0; i < list.length; i++) {
    var item = list[i];
    var itemKey = item.key;
    if (typeof itemKey !== 'undefined') {
      keys[itemKey] = i;
    } else {
      free.push(i);
    }
  }
  return {
    keys: keys,
    free: free
  };
}

// 模拟删除
function remove(arr, index, key) {
  arr.splice(index, 1);
  return {
    from: index,
    key: key
  };
}

function reorder(pList, nList) {
  // N: pList.length
  // M: nList.length
  // O(M) time, O(M) memory
  var nListIndex = keyIndex(nList);
  var nKeys = nListIndex.keys;
  var nFree = nListIndex.free;

  if (nFree.length === nList.length) {
    // 如果 nList 全部节点都没有 key 就不需要 reorder 把 nList 直接作为 reorder 之后的列表返回
    return {
      list: nList,
      moves: null
    };
  }

  // O(N) time, O(N) memory
  var pListIndex = keyIndex(pList);
  var pKeys = pListIndex.keys;
  var pFree = pListIndex.free;

  if (pFree.length === pList.length) {
    // 如果 pList 全部节点都没有 key 就不需要 reorder 把 nList 直接作为 reorder 之后的列表返回
    return {
      list: nList,
      moves: null
    };
  }

  // O(MAX(N, M)) memory
  var rList = [];

  var freeIndex = 0; // 表示没有 key 的节点已使用的个数
  var freeCount = nFree.length; // 表示 nList 中没有 key 的节点的总个数
  var deletedItems = 0; // 被删除的节点的个数

  // O(N) time
  // 遍历 pList 将 pList 有 key 的节点映射到 nList 的节点，如果没有映射，就用 null 表示节点将被删除。pList 空闲节点用 nList 的空闲节点按顺序占位
  for (var i = 0; i < pList.length; i++) {
    var pItem = pList[i];

    if (typeof pItem.key !== 'undefined') {
      // key 节点
      if (nKeys.hasOwnProperty(pItem.key)) {
        // 有映射
        var itemIndex = nKeys[pItem.key];
        rList.push(nList[itemIndex]);
      } else {
        // 没有映射
        deletedItems++;
        rList.push(null);
      }
    } else {
      // 空闲节点
      if (freeIndex < freeCount) {
        // nList 的空闲节点还没用完，继续用
        var _itemIndex = nFree[freeIndex++];
        rList.push(nList[_itemIndex]);
      } else {
        // nList 的空闲节点用完了，这个 pList 的空闲节点没有节点与其对应，应该被删除
        deletedItems++;
        rList.push(null);
      }
    }
  }

  var lastFreeIndex = freeIndex >= nFree.length ? // nList 中下一个空闲节点的位置
  nList.length : // nList 中空闲节点已经用完了
  nFree[freeIndex]; // 未用完

  // O(M) time
  // 遍历 nList 将新增节点／剩余空闲节点追加到 rList 末尾
  for (var j = 0; j < nList.length; j++) {
    var nItem = nList[j];
    if (nItem.key) {
      if (!pKeys.hasOwnProperty(nItem.key)) {
        rList.push(nItem);
      }
    } else if (j >= lastFreeIndex) {
      rList.push(nItem);
    }
  }

  var simulateList = rList.slice(0); // 复制一份，模拟 rList -> nList 重排操作
  var simulateIndex = 0;
  var removes = []; // 被移除的节点
  var inserts = []; // 被插入的节点
  var simulateItem = void 0;

  for (var k = 0; k < nList.length;) {
    var wantedItem = nList[k]; // 目标节点
    simulateItem = simulateList[simulateIndex]; // 模拟节点

    // 先模拟删除
    while (simulateItem === null && simulateList.length) {
      removes.push(remove(simulateList, simulateIndex, null)); // 删除不需要记录 key 的节点
      simulateItem = simulateList[simulateIndex];
    }

    if (!simulateItem || simulateItem.key !== wantedItem.key) {
      // 如果当前位置有 key
      if (wantedItem.key) {
        // 如果当前节点的位置不对，要进行移动
        if (simulateItem && simulateItem.key) {
          if (nKeys[simulateItem.key] !== k + 1) {
            if (isVComponent(simulateItem)) {
              // debugger
            }
            removes.push(remove(simulateList, simulateIndex, simulateItem.key)); // 先移除当前位置的节点
            simulateItem = simulateList[simulateIndex]; // 删除后，该位置对应的是下一个节点
            // 然后在当前位置插入目标节点
            if (!simulateItem || simulateItem.key !== wantedItem.key) {
              // 如果删除之后还不对应，就插入目标节点
              inserts.push({ key: wantedItem.key, to: k });
            } else {
              // 删除后正好对应就不需要插入了
              simulateIndex++; // 检查下一个
            }
          } else {
            // nKeys[simulateItem.key] === k + 1 如果下一个目标节点和当前模拟节点对应
            inserts.push({ key: wantedItem.key, to: k });
          }
        } else {
          // 位置不对，插入
          inserts.push({ key: wantedItem.key, to: k });
        }
        k++;
      }
      // 目标节点没有 key 但是 模拟节点有 key
      else if (simulateItem && simulateItem.key) {
          // 位置不对，删除
          removes.push(remove(simulateList, simulateIndex, simulateItem.key));
        }
    } else {
      simulateIndex++;
      k++;
    }
  }

  // 删除所有剩余节点
  while (simulateIndex < simulateList.length) {
    simulateItem = simulateList[simulateIndex];
    removes.push(remove(simulateList, simulateIndex, simulateItem && simulateItem.key));
  }

  // 这种情况不需要移位，只需要删除多余的节点：没有 key 对应的节点、多余的空闲节点
  if (removes.length === deletedItems && !inserts.length) {
    return {
      list: rList,
      moves: null
    };
  }

  return {
    list: rList,
    moves: {
      removes: removes,
      inserts: inserts
    }
  };
}

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
// [f1, A1, B1, C1, D, f2]
// 目标: [f3, C2, B2, A2, f4, E, f5]
// insert(null, E) => [f1, A1, B1, C1, D, f2, E]
// insert(null, f5) => [f1, A1, B1, C1, D, f2, E, f5]
// patch order:
// remove(1, A) => [f1, B1, C1, D, f2, E, f5], map:{A: A1}
// remove(2, C) => [f1, B1, D, f2, E, f5], map:{A: A1, C: C1}
// remove(2, null) => [f1, B1, f2, E, f5]
// insert(1, C) => [f1, C1, B1, f2, E, f5]
// insert(3, A) => [f1, C1, B1, A1, f2, E, f5]
// patch 子节点
// patch(f1, f3)
// patch(A1, A2)
// patch(B1, B2)
// patch(C1, C2)
// remove D 已删除，不会重复删除
// patch(f2, f4)

function staticClass(setValue, element, context) {
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

function getObjectFromPath(data, path) {
  var props = parsePath(path);
  var result = props.length > 0 ? data : void 0;
  for (var i = 0; i < props.length; ++i) {
    result = result[props[i]];
    if (!result) {
      break;
    }
  }
  return result;
}

function setObjectFromPath(data, path, value) {
  var props = parsePath(path);
  var current = data,
      parent = data;
  for (var i = 0; i < props.length - 1; ++i) {
    parent = current;
    current = current[props[i]];
    if (isUndefined(current)) {
      current = {};
      parent[props[i]] = current;
    }
  }
  if (i >= 0) {
    if ((typeof current === 'undefined' ? 'undefined' : _typeof(current)) === 'object') {
      current[props[i]] = value;
    } else {
      current = {};
      current[props[i]] = value;
      parent[props[i - 1]] = current;
    }
  }
}

function modelSelect(currentValue, element, context) {
  if (element.multiple) {
    var options = element.options;
    for (var i = 0; i < options.length; ++i) {
      if (currentValue.indexOf(options[i].value) !== -1) {
        options[i].selected = true;
      } else {
        options[i].selected = false;
      }
    }
  } else {
    if (element.value !== currentValue) {
      element.value = currentValue;
    }
  }
}

function modelRadio(currentValue, element, context) {
  element.checked = currentValue === element.value;
}

function modelCheckbox(currentValue, element, context) {
  if (isArray(currentValue)) {
    element.checked = currentValue.indexOf(element.value) !== -1;
  } else {
    element.checked = currentValue === element.value;
  }
}

function modelInput(currentValue, element, context) {
  if (element.value !== currentValue) {
    element.value = currentValue;
  }
}

function model(value, element, context) {
  var currentValue = getObjectFromPath(context.state, value);
  var tag = element.tagName.toLowerCase();
  var type = element.type;

  if (tag === 'select') {
    modelSelect(currentValue, element, context);
  } else if (tag === 'input' && type === 'radio') {
    modelRadio(currentValue, element, context);
  } else if (tag === 'input' && type === 'checkbox') {
    modelCheckbox(currentValue, element, context);
  } else if (tag === 'textarea' || tag === 'input') {
    modelInput(currentValue, element, context);
  } else {
    // not support
  }
}

function attachEvent(el, eventName, handler) {
  if (el.addEventListener) {
    el.addEventListener(eventName, handler, false);
  } else if (el.attachEvent) {
    el.attachEvent(eventName, handler);
  }
}

var HtmlBooleanAttributes = ['disabled', 'checked', 'selected'];

function handleDirective(directive, value, element, context) {
  switch (directive) {
    case 'show':
      show(value, element, context);
      break;
    case 'staticClass':
      staticClass(value, element, context);
      break;
    case 'style':
      style(value, element, context);
      break;
    case 'model':
      model(value, element, context);
      break;
    default:
      if (HtmlBooleanAttributes.indexOf(directive) !== -1) {
        if (value) {
          setAttr(element, directive, directive);
        } else {
          removeAttr(element, directive);
        }
      } else {
        setAttr(element, directive, value);
      }
      break;
  }
}

function bindDirective(directive, value, element, context) {
  switch (directive) {
    case 'model':
      if (element.type === 'radio') {
        attachEvent(element, 'change', function handleChange(event) {
          var selectValue = event.currentTarget.value;
          var currentState = deepClone(context.state);
          setObjectFromPath(currentState, value, selectValue);
          context.setState(currentState);
        });
      } else if (element.type === 'checkbox') {
        attachEvent(element, 'change', function handleChange() {
          var selectValue = event.currentTarget.value;
          var currentState = deepClone(context.state);
          var preValue = getObjectFromPath(currentState, value);
          if (event.currentTarget.checked) {
            if (preValue.indexOf(selectValue) === -1) {
              preValue.push(selectValue);
            }
          } else {
            var i = 0;
            while (i < preValue.length) {
              if (preValue[i] === selectValue) {
                preValue.splice(i, 1);
                break;
              }
              ++i;
            }
          }
          context.setState(currentState);
        });
      } else if (element.tagName === 'SELECT') {
        attachEvent(element, 'change', function handleInput() {
          // 通过 path 设置 state
          var currentState = deepClone(context.state);
          if (element.multiple) {
            var options = element.options;
            var newValue = [];
            for (var i = 0; i < options.length; ++i) {
              if (options[i].selected) {
                newValue.push(options[i].value);
              }
            }
            setObjectFromPath(currentState, value, newValue);
            context.setState(currentState);
          } else {
            setObjectFromPath(currentState, value, element.value);
            context.setState(currentState);
          }
        });
      } else {
        attachEvent(element, 'input', function handleInput() {
          // 通过 path 设置 state
          var currentState = deepClone(context.state);
          setObjectFromPath(currentState, value, element.value);
          context.setState(currentState);
        });
      }
      break;
    default:
  }
}

function removeClassAttr(removeValue, element, context) {
  if (isString(removeValue)) {
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
    case 'staticClass':
      removeClassAttr(value, element, context);
      break;
  }
}

// 映射 dom 树与 virtual-dom 树，找到对应索引的 dom 节点并保存索引映射
function domIndex(domTree, vdomTree, indices) {
  if (indices.length === 0) {
    return {};
  } else {
    var mapping = {};
    recurse(domTree, vdomTree, indices, mapping, 0);
    return mapping;
  }
}

function recurse(rootNode, vdomTree, indices, mapping, rootIndex) {
  if (rootNode) {
    if (indexInRange(indices, rootIndex, rootIndex)) {
      mapping[rootIndex] = rootNode;
    }
    if (vdomTree.children) {
      // 只有 VNode 要查找 VText/VComponent 不需要
      var currentIndex = rootIndex;
      var childNodes = rootNode.childNodes;
      for (var i = 0; i < vdomTree.children.length; ++i) {
        var vChild = vdomTree.children[i] || {};
        currentIndex += 1;
        var nextIndex = currentIndex + (vChild.count || 0);
        if (indexInRange(indices, currentIndex, nextIndex)) {
          recurse(childNodes[i], vChild, indices, mapping, currentIndex);
        }
        currentIndex = nextIndex;
      }
    }
  }
}

// 查找 indices 数组（已排序），判断是否存在 [min, max] 区间内的元素
function indexInRange(indices, min, max) {
  if (indices.length === 0 || min > max) {
    return false;
  }
  var result = false;
  var head = 0,
      tail = indices.length - 1;
  var current = void 0,
      currentIndex = void 0;
  while (head <= tail) {
    currentIndex = (head + tail) / 2 >> 0; // 移位操作为了快速向下取整
    current = indices[currentIndex];
    if (head === tail) {
      result = current >= min && current <= max;
      break;
    } else if (current < min) {
      head = currentIndex + 1;
    } else if (current > max) {
      tail = currentIndex - 1;
    } else {
      // min <= current <= max
      result = true;
      break;
    }
  }
  return result;
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

function callHooks(hookName, params) {
  var _callbacks = this._hooks[hookName] || [];
  for (var i = 0; i < _callbacks.length; ++i) {
    _callbacks[i].apply(this, params);
  }
}

var PATCH = {
  REPLACE: 0, // 替换节点
  INSERT: 1, // 插入
  REMOVE: 2, // 移除
  REORDER: 3, // 重排
  PROPS: 4, // 修改属性
  TEXT: 5, // 替换文本
  COMPONENT: 6 // 组件 patch
};

function ascending(a, b) {
  return a > b ? 1 : -1;
}

// 移除节点
// 如果是 DOM 节点，调用 removeNode
// 如果是组件节点，调用 $destroy
// 先删子节点，递归删除
function doRemoveNode(domNode, target) {
  if (isVComponent(target)) {
    target.$destroy(); // 注意已经 destroyed 下次要重新生成
  } else if (target.children) {
    for (var i = 0; i < target.children.length; ++i) {
      doRemoveNode(domNode.childNodes[i], target.children[i]);
    }
  }
  removeNode(domNode);
}

// 根据补丁更新 DOM 节点
function doApplyPatches(context, domNode, patches) {
  for (var i = 0; i < patches.length; ++i) {
    var patch = patches[i];
    switch (patch.type) {
      case PATCH.REPLACE:
        // 替换元素节点
        replaceNode(patch.node.$render(context), domNode);
        break;
      case PATCH.PROPS:
        // 属性修改
        patchProps(domNode, patch, context);
        break;
      case PATCH.TEXT:
        // 替换文本内容
        domNode.data = patch.data;
        break;
      case PATCH.REORDER:
        // 子节点重新排序
        patchReorder(context, domNode, patch.moves);
        break;
      case PATCH.INSERT:
        if (isVComponent(patch.node)) {
          // 插入组件
          var childComponent = patch.node;
          callHooks.call(childComponent, 'beforeMount');
          var $root = childComponent.$render();
          domNode.appendChild($root);
          callHooks.call(childComponent, 'mounted', [$root]);
        } else {
          // 插入节点
          if (domNode) {
            domNode.appendChild(patch.node.$render(context));
          } else {
            // 如果节点不存在了，不需要执行插入操作
          }
        }
        break;
      case PATCH.REMOVE:
        doRemoveNode(domNode, patch.node);
        break;
      case PATCH.COMPONENT:
        if (patch.pVdom.key === patch.nVdom.key) {
          patch.pVdom.$update();
        } else {
          var _$root = patch.pVdom.$root;
          patch.pVdom.$destroy();
          patch.nVdom.$mount(_$root);
        }
        break;
      default:
      // warn
    }
  }
}

function applyPatch(context, domNode, patch) {
  var patches = patch.patches;
  // 先找需要 patch 的 dom 节点
  var indices = [];
  for (var p in patches) {
    if (patches.hasOwnProperty(p)) {
      indices.push(+p); // 一定要转成数字
    }
  }
  indices.sort(ascending);
  var pVdom = patch.pVdom;
  var domMapping = domIndex(domNode, pVdom, indices);
  for (var i = 0; i < indices.length; ++i) {
    var idx = indices[i];
    doApplyPatches(context, domMapping[idx], patches[idx]);
  }
}

// @TODO 这里如何处理组件？
function patchReorder(context, domNode, moves) {
  var removes = moves.removes;
  var inserts = moves.inserts;
  var childNodes = domNode.childNodes;
  var keyMap = {};
  // 先删除
  for (var i = 0; i < removes.length; ++i) {
    var remove = removes[i];
    var toRemove = childNodes[remove.from];
    if (remove.key) {
      // 需要保留，等待重新插入
      keyMap[remove.key] = toRemove;
    }
    removeNode(toRemove);
  }
  // 后插入
  for (var _i = 0; _i < inserts.length; ++_i) {
    var insert = inserts[_i];
    var target = insert.to < childNodes.length ? childNodes[insert.to] : null;
    var toInsert = keyMap[insert.key];
    domNode.insertBefore(toInsert, target);
  }
}

// 检查是否指令属性
function isAttrDirective(attr) {
  return (/^@|n-|:/.test(attr)
  );
}
// 检查是否事件指令
function patchProps(domNode, patch, context) {
  var setProps = patch.props.set;
  var removeProps = patch.props.remove;
  for (var p in setProps) {
    if (setProps.hasOwnProperty(p)) {
      // 检查是否指令属性
      if (isAttrDirective(p)) {
        // 处理指令
        if (/^n-/.test(p)) {
          handleDirective(p.slice(2), setProps[p], domNode, context);
        } else if (/^:/.test(p)) {
          handleDirective(p.slice(1), setProps[p], domNode, context);
        } else {
          // 事件不处理
        }
      } else {
        // 普通属性
        if (isUndefined(patch.props[p])) {
          removeAttr(domNode, p);
        } else {
          setAttr(domNode, p, patch.props[p]);
        }
      }
    }
  }
  // @TODO remove 错误
  for (var _p in removeProps) {
    if (removeProps.hasOwnProperty(_p)) {
      if (isAttrDirective(_p)) {
        if (/^n-/.test(_p)) {} else if (/^:/.test(_p)) {
          handleDirectiveRemove(_p.slice(1), removeProps[_p], domNode, context);
        } else {}
      }
    }
  }
}

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
    } else if (p === 'n-model') {
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

// 按照先删除后插入的顺序
function diffChildren(pChildren, nChildren, parentIndex, patches, parentPatches) {
  var diffs = reorder(pChildren, nChildren);
  var orderedList = diffs.list;

  var pLen = pChildren.length;
  var oLen = orderedList.length;
  var len = pLen > oLen ? pLen : oLen; // const len = max(pLen, oLen)

  var currentIndex = parentIndex;
  for (var i = 0; i < len; ++i) {
    var pNode = pChildren[i];
    var nNode = orderedList[i];
    currentIndex = currentIndex + 1;
    if (!pNode) {
      if (nNode) {
        // 旧的没有新的有，插入（末尾）
        parentPatches.push({
          type: PATCH.INSERT,
          node: nNode
        });
      }
    } else {
      diffWalk(pNode, nNode, currentIndex, patches);
    }
    if (pNode && pNode.count) {
      currentIndex += pNode.count;
    }
  }
  if (diffs.moves) {
    parentPatches.push({
      type: PATCH.REORDER,
      moves: diffs.moves
    });
  }
}

function diffWalk(pVdom, nVdom, currentIndex, patches) {
  var currentPatches = []; // 当前层级的 patch
  if (nVdom == null) {
    // * VS null|undefined
    currentPatches.push({
      type: PATCH.REMOVE,
      from: currentIndex,
      node: pVdom,
      key: null
    });
  } else if (isVComponent(pVdom) && isVComponent(nVdom)) {
    // Component VS Component
    currentPatches.push({
      type: PATCH.COMPONENT,
      pVdom: pVdom,
      nVdom: nVdom
    });
  } else if (isVNode(pVdom) && isVNode(nVdom)) {
    // VNode VS VNode
    if (pVdom.tagName !== nVdom.tagName || pVdom.key !== nVdom.key) {
      // 不同 tagName/key 节点: 替换
      currentPatches.push({
        type: PATCH.REPLACE,
        node: nVdom
      });
    } else {
      // 同 key 同 tagName 节点: 比较属性和子节点
      var propsPatches = diffProps(pVdom, nVdom);
      if (propsPatches) {
        currentPatches.push({
          type: PATCH.PROPS,
          props: propsPatches
        });
      }
      // 继续 diff 子节点
      diffChildren(pVdom.children, nVdom.children, currentIndex, patches, currentPatches);
    }
  } else if (isVText(pVdom) && isVText(nVdom)) {
    // VText VS VText
    if (pVdom.data !== nVdom.data) {
      // 内容不一样的时候才替换（只替换内容即可）
      currentPatches.push({ type: PATCH.TEXT, data: nVdom.data });
    }
  } else {
    // 不同类型的节点
    currentPatches.push({
      type: PATCH.REPLACE,
      node: nVdom,
      preNode: pVdom
    });
  }
  if (currentPatches.length > 0) {
    patches[currentIndex] = currentPatches;
  }
}

function diff(pVdom, nVdom) {
  var patch = {};
  patch.pVdom = pVdom;
  var patches = {};
  diffWalk(pVdom, nVdom, 0, patches);
  patch.patches = patches;
  return patch;
}

function NaiveException(message) {
  this.name = 'NaiveException';
  this.message = message;
}

function VNode(tagName, props, children, key) {
  this.nodeType = NodeTypes['VNODE'];
  this.tagName = tagName;
  this.props = props || {};
  this.key = key ? String(key) : undefined; // key 用来标识节点，方便 diff
  var childNodes = [];
  children = children || [];
  for (var i = 0; i < children.length; ++i) {
    var child = children[i];
    if (isArray(child)) {
      childNodes = childNodes.concat(h.call(this, child));
    } else {
      if (child !== false) {
        childNodes.push(h.call(this, child));
      }
    }
  }
  this.children = childNodes;
  var count = this.children.length;
  for (var _i = 0; _i < this.children.length; ++_i) {
    count += this.children[_i].count || 0;
  }
  this.count = count; // 记录子节点数，在 patch 的时候找到节点位置
}

// vdom => dom
VNode.prototype.$render = function renderVNodeToElement(context) {
  var element = createElement(this.tagName);
  var props = this.props;
  var nodeContext = this;
  for (var p in props) {
    if (props.hasOwnProperty(p)) {
      if (/^n-/.test(p)) {
        bindDirective(p.slice(2), props[p], element, context);
        handleDirective(p.slice(2), props[p], element, context);
      } else if (/^:/.test(p)) {
        handleDirective(p.slice(1), props[p], element, context);
      } else if (/^@/.test(p)) {
        var eventName = p.slice(1);
        var handler = props[p];
        attachEvent(element, eventName, handler);
      } else {
        setAttr(element, p, props[p]);
      }
    }
  }
  for (var i = 0; i < this.children.length; ++i) {
    var child = this.children[i];
    // @TODO 重新生成 vdom 的时候不应该总是重新生成 VComponent
    if (isVComponent(child)) {
      callHooks.call(child, 'beforeMount');
      var $root = child.$render();
      appendChild($root, element);
      callHooks.call(child, 'mounted', [$root]);
    } else {
      appendChild(child.$render(context), element);
    }
  }
  return element;
};

function VText(text) {
  this.nodeType = NodeTypes['VTEXT'];
  this.data = text;
}

VText.prototype.$render = function renderVTextToTextNode() {
  return createTextNode(this.data);
};

function updateProps(component, props) {
  var combineProps = {};
  if (props) {
    for (var p in props) {
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
  deepExtend(component.state, combineProps);
}

// create vdom
// @TODO 需要增强参数
function h(tagName, props, children, key) {
  var context = this || {};
  var components = context['components'] || {};
  if (isVNode(tagName) || isVText(tagName) || isVComponent(tagName)) {
    return tagName;
  } else if (isPlainObject(tagName)) {
    if (components.hasOwnProperty(tagName.tagName)) {
      var componentProps = tagName.props || tagName.attrs;
      // 如果是已生成的组件，不要重新生成
      var _components = context['_components'] || {};
      if (_components[tagName.key]) {
        updateProps(_components[tagName.key], componentProps);
        return _components[tagName.key];
      } else {
        // 可能是 props 或者 attrs
        return components[tagName.tagName](componentProps, tagName.children, tagName.key);
      }
    } else {
      return new VNode(tagName.tagName, tagName.attrs, tagName.children, tagName.key);
    }
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
      var _components2 = context['_components'] || {};
      if (_components2[key]) {
        updateProps(_components2[key], props);
        return _components2[key];
      } else {
        return components[tagName](props, children, key);
      }
    } else {
      return new VNode(tagName, props, children, key);
    }
  }
}

var resolved = !isUndefined(Promise) && Promise.resolve();
var defer = resolved ? function (f) {
  resolved.then(f);
} : setTimeout;

var renderCallbacks = [];

var nextTickCallbacks = [];

var isDirty = false;

function nextTick(callback) {
  nextTickCallbacks.push(callback);
  if (renderCallbacks.length === 0) {
    defer(doNextTick);
  }
}

function enqueueRender(component) {
  if (!component._dirty && (component._dirty = true) && renderCallbacks.push(component) === 1) {
    isDirty = true;
    defer(rerender);
  }
}

function doNextTick() {
  if (isDirty) {
    // wait for rendering
    return false;
  }
  var p = void 0,
      list = nextTickCallbacks;
  nextTickCallbacks = [];
  while (p = list.shift()) {
    p();
  }
}

function rerender() {
  var p = void 0,
      list = renderCallbacks;
  renderCallbacks = [];
  while (p = list.pop()) {
    if (p._dirty) {
      p.$update();
    }
  }
  isDirty = false;
  doNextTick();
}

var componentId = 1;

// _init => 首次生成 vdom
// $update => 重新生成 vdom => diff => patches => 更新 dom（不会重新生成 $root）
// $render => vdom => 调用 vdom 的 $render 生成 dom（第一次调用 $render 之后才会有 $root）
// $mount => $render => 将 $root 挂载到页面
// setState => 更新 state 但不会立即更新 vdom => $update 此时才会更新

// 因为是在应用内生成的组件，所以不需要用 uuid 算法，只需要保证在应用内唯一即可
// componentId 保证 component 类型的唯一性，时间戳保证组件唯一性
function uuid() {
  return '$naive-component-' + componentId++ + '-' + new Date().getTime();
}

function emptyRender(h$$1) {
  return h$$1('');
}

function Naive(options) {
  this.nodeType = NodeTypes['VCOMPONENT'];
  options = options || {};
  this.name = options.name || '';
  this.key = options.key || uuid();
  // @TODO 重复初始化？
  // debugger
  this._hooks = {};
  if (options.hasOwnProperty('state')) {
    if (!isFunction(options.state)) {
      throw new NaiveException('state should be [Function]');
    }
    var _state = options.state();
    if (isPlainObject(_state)) {
      this.state = _state;
    } else {
      throw new NaiveException('state() must return [Plain Object]');
    }
  } else {
    this.state = {};
  }
  this.props = {};
  var combineProps = {};
  // 合并 state 和 options.props
  if (options.props) {
    for (var p in options.props) {
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
  deepExtend(this.state, combineProps);
  callHooks.call(this, 'beforeCreate');
  var context = this;
  var _vdomRender = options.render || emptyRender;
  var _templateHelpers = {
    "if": function _if(condition, options) {
      return condition ? h.call(context, options) : false;
    },
    "each": function each(list, iteratorCount, createItem) {
      var nodes = [];
      if (isArray(list)) {
        for (var i = 0; i < list.length; ++i) {
          var item = list[i];
          var _itemUid = isPlainObject(item) && 'id' in item ? item['id'] : i;
          var params = [item, _itemUid];
          if (iteratorCount === 2) {
            params = [item, i, _itemUid];
          } else if (iteratorCount === 3) {
            params = [item, i, i, _itemUid];
          }
          nodes.push(h(createItem.apply(context, params)));
        }
      } else {
        var idx = 0;
        for (var _p in list) {
          if (list.hasOwnProperty(_p)) {
            var _item = list[_p];
            var _itemUid2 = isPlainObject(_item) && 'id' in _item ? _item['id'] : _p;
            var _params = [_item, _itemUid2];
            if (iteratorCount === 2) {
              _params = [_item, _p, _itemUid2];
            } else if (iteratorCount === 3) {
              _params = [_item, _p, idx, _itemUid2];
            }
            nodes.push(h(createItem.apply(context, _params)));
            idx++;
          }
        }
      }
      return nodes;
    }
  };
  this.$vdomRender = function $vdomRender() {
    var vdom = _vdomRender.call(this, function createVdom() {
      return h.apply(context, toArray$$1(arguments));
    }, _templateHelpers);
    return vdom;
  };
  this.$root = null; // 第一次 $render 之后才会生成 $root
  this.components = {}; // 组件描述对象列表
  this._components = {}; // 组件实例映射
  var componentsOptions = options.components || {};
  for (var _p2 in componentsOptions) {
    if (componentsOptions.hasOwnProperty(_p2)) {
      var componentDefine = componentsOptions[_p2] || {};
      componentDefine.name = componentDefine.name || _p2;
      componentDefine.parent = this;
      this.components[_p2] = createComponentCreator(this, componentDefine);
    }
  }
  this.parent = options.parent || null;
  this._init(options);
  callHooks.call(this, 'created');
}

function createComponentCreator(context, componentDefine) {
  return function createComponent(props, children, key) {
    var newChild = new Naive(deepExtend({}, componentDefine, { props: props, key: key }));
    context._components[key] = newChild;
    return newChild;
  };
}

var prtt = Naive.prototype;

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
      addHook.call(this, p, hooks[p]);
    }
  }
  if (options.init) {
    options.init.call(this);
  }
  this.$vdom = this.$vdomRender();
};

prtt.setState = function setState(state) {
  if (state === this.state) {
    throw new NaiveException('Never do `setState` with `this.state`');
  }
  simpleExtend(this.state, state);
  enqueueRender(this);
  return this;
};

// update view: state => vdom => diff => patches => dom
prtt.$update = function $update() {
  if (!this.$root) {
    return this;
    // throw new NaiveException('VComponent must be mounted before update')
  }
  // console.log(this)
  callHooks.call(this, 'beforeUpdate', [deepClone(this.state)]);
  var preVdom = this.$vdom;
  this.$vdom = this.$vdomRender();
  // console.log(preVdom, this.$vdom)
  var patches = diff(preVdom, this.$vdom);
  // console.log(patches)
  applyPatch(this, this.$root, patches);
  callHooks.call(this, 'updated', [deepClone(this.state)]);
  this._dirty = false;
  return this;
};

prtt.$nextTick = function $nextTick(callback) {
  nextTick(callback);
};

// render view: vdom => dom
prtt.$render = function $render() {
  this.$root = this.$vdom.$render(this);
  return this.$root;
};

// mount
prtt.$mount = function $mount(selector) {
  var mountPoint = isString(selector) ? getElement(selector) : selector;
  if (!mountPoint) {
    throw new NaiveException('Mount point not found');
  }
  callHooks.call(this, 'beforeMount');
  var $root = this.$render();
  replaceNode($root, mountPoint);
  callHooks.call(this, 'mounted', [$root]);
};

function doDestroy(vdom) {
  if (isVComponent(vdom)) {
    vdom.$destroy();
  } else if (vdom.children) {
    for (var i = 0; i < vdom.children.length; ++i) {
      doDestroy(vdom.children[i]);
    }
  }
}

prtt.$destroy = function $destroy() {
  if (!this.$root) {
    return this;
  }
  var vdom = this.$vdom;
  for (var i = 0; i < vdom.children.length; ++i) {
    doDestroy(vdom.children[i]);
  }
  callHooks.call(this, 'beforeDestroy');
  this.$root = null; // 释放 dom 节点
  // 销毁事件监听
  callHooks.call(this, 'destroyed');
  // 销毁勾子回调
  for (var p in this._hooks) {
    if (this._hooks.hasOwnProperty(p)) {
      removeHook.call(this, p);
    }
  }
  // 从父组件的 _components 中移除
  if (this.parent) {
    if (this.parent._components.hasOwnProperty(this.key)) {
      delete this.parent._components[this.key];
    }
  }
};

export default Naive;
