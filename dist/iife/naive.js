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

function toArray$$1(obj) {
  return Array.prototype.slice.call(obj, 0);
}

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

VText.prototype.render = function renderVTextToTextNode() {
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
  var result = props.length > 0 ? data : undefined;
  for (var i = 0; i < props.length; ++i) {
    result = result[props[i]];
    if (!result) {
      break;
    }
  }
  return result;
}

function model(value, element, context) {
  var currentValue = getObjectFromPath(context.state, value);
  if (element.value !== currentValue) {
    element.value = currentValue;
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
    case 'model':
      model(value, element, context);
      break;
    default:
      if (directive === 'disabled' || directive === 'checked') {
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
      attachEvent(element, 'input', function handleInput() {
        var setter = {};
        setter[value] = element.value;
        context.setState(setter);
      });
      break;
    default:
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

function NaiveException(message) {
  this.name = 'NaiveException';
  this.message = message;
}

function VNode(tagName, props, children, key) {
  this.tagName = tagName;
  this.props = props || {};
  this.key = key ? String(key) : undefined; // key 用来标识节点，方便 diff
  var childNodes = [];
  children = children || [];
  for (var i = 0; i < children.length; ++i) {
    var child = children[i];
    if (isVNode(child) || isVText(child) || isVComponent(child)) {
      childNodes.push(child);
    } else if (typeof child === 'string' || typeof child === 'number') {
      childNodes.push(new VText(child));
    } else if (isArray(child)) {
      childNodes = childNodes.concat(child);
    } else {
      // warn('children 类型不支持');
    }
  }
  this.children = childNodes;
  var count = this.children.length;
  for (var _i = 0; _i < this.children.length; ++_i) {
    count += this.children[_i].count || 0;
  }
  this.count = count; // 记录子节点数，在 patch 的时候找到节点位置
}

// 检查是否指令属性
function matchExpression(exp) {
  return exp.match(/(.*)\((.*)\)/);
}

function parseArgumentList(exp) {
  var i = 0;
  var needSeparate = false;
  var inSingle = false;
  var single = [];
  var inDouble = false;
  var double = [];
  var inWord = false;
  var word = [];
  var args = [];
  while (i < exp.length) {
    var t = exp[i];
    if (t === '\'') {
      if (inSingle) {
        args.push({
          type: 'string',
          value: single.join('')
        });
        single.splice(0);
        inSingle = false;
        needSeparate = true;
      } else if (inDouble) {
        double.push(t);
      } else if (inWord) {
        throw new NaiveException('参数错误');
      } else if (needSeparate) {
        throw new NaiveException('参数错误');
      } else {
        inSingle = true;
      }
    } else if (t === '"') {
      if (inDouble) {
        args.push({
          type: 'string',
          value: double.join('')
        });
        double.splice(0);
        inDouble = false;
        needSeparate = true;
      } else if (inSingle) {
        double.push(t);
      } else if (inWord) {
        throw new NaiveException('参数错误');
      } else if (needSeparate) {
        throw new NaiveException('参数错误');
      } else {
        inDouble = true;
      }
    } else if (t === ',') {
      if (inSingle) {
        single.push(t);
      } else if (inDouble) {
        double.push(t);
      } else if (inWord) {
        args.push({
          type: 'exp',
          value: word.join('')
        });
        word.splice(0);
        inWord = false;
        needSeparate = false;
      } else if (!needSeparate) {
        throw new NaiveException('参数错误');
      } else {
        needSeparate = false;
      }
    } else if (t === ' ') {
      if (inSingle) {
        single.push(t);
      } else if (inDouble) {
        double.push(t);
      } else if (inWord) {
        throw new NaiveException('参数错误');
      }
    } else {
      if (inSingle) {
        single.push(t);
      } else if (inDouble) {
        double.push(t);
      } else if (inWord) {
        word.push(t);
      } else {
        if (needSeparate) {
          throw new NaiveException('参数错误');
        } else {
          word.push(t);
          inWord = true;
        }
      }
    }
    ++i;
  }
  if (inSingle || inDouble) {
    throw new NaiveException('参数错误');
  } else if (inWord) {
    args.push({
      type: 'exp',
      value: word.join('')
    });
  }
  return args;
}

function parseExpression$$1(exp, data) {
  if (/^[+-]?\d+\.?\d*?$/.test(exp)) {
    return Number(exp);
  } else {
    return getObjectFromPath(data, exp);
  }
}

function bindEvent(eventName, exp, element, context) {
  var handlerFunc = void 0;
  if (isFunction(exp)) {
    handlerFunc = exp;
  } else {
    (function () {
      var matches = matchExpression(exp);
      if (matches) {
        (function () {
          var methodName = matches[1];
          handlerFunc = function handlerFunc(evt) {
            var args = parseArgumentList(matches[2]);
            var _args = [];
            for (var i = 0; i < args.length; ++i) {
              if (args[i].type === 'string') {
                _args.push(args[i].value);
              } else if (args[i].value === '$event') {
                _args.push(evt);
              } else {
                _args.push(parseExpression$$1(args[i].value, this.state));
              }
            }
            this[methodName].apply(this, _args);
          };
        })();
      } else {
        handlerFunc = context[exp];
      }
    })();
  }
  attachEvent(element, eventName, function handler(evt) {
    return handlerFunc.call(context, evt);
  });
}

VNode.prototype.render = function renderVNodeToElement(context) {
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
        var exp = props[p];
        bindEvent(eventName, exp, element, context);
      } else {
        setAttr(element, p, props[p]);
      }
    }
  }
  for (var i = 0; i < this.children.length; ++i) {
    appendChild(this.children[i].render(context), element);
  }
  return element;
};

function isVNode(node) {
  return node instanceof VNode;
}

function isVText(node) {
  return node instanceof VText;
}

function isVComponent(node) {
  return node instanceof Naive;
}

// 分别找到有 key 的元素位置和没有 key 的元素的位置
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

var PATCH = {
  REPLACE: 0, // 替换节点
  INSERT: 1, // 插入
  REMOVE: 2, // 移除
  REORDER: 3, // 重排
  PROPS: 4, // 修改属性
  TEXT: 5 // 替换文本
};

function ascending(a, b) {
  return a > b ? 1 : -1;
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
      case PATCH.INSERT:
        // append
        if (domNode) {
          domNode.appendChild(_patch.node.render(context));
        }
        break;
      case PATCH.REMOVE:
        removeNode(domNode);
        break;
      default:
      // warn
    }
  }
}

function patch(context, domNode, patch) {
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
  if (domNode._isFragment) {
    pVdom = { children: patch.pVdom };
  }
  var domMapping = domIndex(domNode, pVdom, indices);
  for (var i = 0; i < indices.length; ++i) {
    var idx = indices[i];
    applyPatches(context, domMapping[idx], patches[idx]);
  }
}

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
          var eventName = p.slice(1);
          var exp = setProps[p];
          // detachEvent(domNode, eventName); // @TODO 需要解除绑定原有的事件?
          bindEvent(eventName, exp, domNode, context);
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
  var len = pLen > oLen ? pLen : oLen; // const len = max(pLen, oLen);

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
  if (nVdom === null) {
    // * VS null
    currentPatches.push({
      type: PATCH.REMOVE,
      from: currentIndex,
      key: null
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
  } else if (isVComponent(pVdom) || isVComponent(nVdom)) {// * VS Component | Component VS *
    // 忽略，不在这里处理
  } else {
    // 不同类型的节点
    currentPatches.push({
      type: PATCH.REPLACE,
      node: nVdom
    });
  }
  if (currentPatches.length > 0) {
    patches[currentIndex] = currentPatches;
  }
}

function diff(pVdom, nVdom) {
  var patch$$1 = {};
  patch$$1.pVdom = pVdom;
  var patches = {};
  if (isArray(pVdom)) {
    var currentPatches = [];
    diffChildren(pVdom, nVdom, 0, patches, currentPatches);
    if (currentPatches.length > 0) {
      patches[0] = currentPatches;
    }
  } else {
    diffWalk(pVdom, nVdom, 0, patches);
  }
  patch$$1.patches = patches;
  return patch$$1;
}

function h(tagName, props, children, key) {
  var context = this || {};
  var components = context['components'] || {};
  if (isVNode(tagName) || isVText(tagName) || isVComponent(tagName)) {
    return tagName;
  } else if (isPlainObject(tagName)) {
    if (components.hasOwnProperty(tagName.tagName)) {
      return components[tagName.tagName](tagName.props, tagName.children, tagName.key);
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
      return components[tagName](props, children, key);
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

var componentId = 1;

function uuid() {
  return '$naive-component-' + componentId++ + new Date().getTime();
}

function emptyRender() {
  return null;
}

function Naive(options) {
  options = options || {};
  this.name = options.name || '';
  this.key = options.key || uuid();
  this._hooks = {};
  if ('state' in options) {
    if (!isFunction(options.state)) {
      throw new NaiveException('state 必须是 [Function]');
    }
    var _state = options.state();
    if (isPlainObject(_state)) {
      this.state = _state;
    } else {
      throw new NaiveException('state 必须返回 [Plain Object]');
    }
  } else {
    this.state = {};
  }
  this.props = {};
  // 合并 state 和 options.props
  if (options.props) {
    for (var p in options.props) {
      if (options.props.hasOwnProperty(p)) {
        this.props[p.slice(1)] = options.props[p];
      }
    }
  }
  extend(this.state, this.props);
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
    var vdom = _vdomRender.call(this, function createVdom() {
      return h.apply(context, toArray$$1(arguments));
    }, _templateHelpers);
    return vdom;
  };
  this.$root = null;
  // components
  this.components = {};
  this._components = {};
  var componentsOptions = options.components || {};
  for (var _p in componentsOptions) {
    if (componentsOptions.hasOwnProperty(_p)) {
      var componentDefine = componentsOptions[_p] || {};
      componentDefine.name = componentDefine.name || _p;
      this.components[_p] = createComponentCreator(this, componentDefine);
    }
  }
  this._init(options);
}

function createComponentCreator(context, componentDefine) {
  return function createComponent(props, children, key) {
    if (!context._components[key]) {
      context._components[key] = new Naive(extend({ props: props, key: key }, componentDefine));
    } else {
      updateProps(context._components[key], props);
    }
    return context._components[key];
  };
}

var prtt = Naive.prototype;

prtt.render = function render() {
  this.$root = this.vdom.render(this);
  return this.$root;
};

prtt.setState = function setState(state) {
  extend(this.state, state);
  this.update(); // @TODO nextTick 的时候再 update
  return this;
};

// 更新视图
prtt.update = function update() {
  if (!this.$root) {
    return this;
  }
  var preVdom = this.vdom;
  this.vdom = this.vdomRender();
  // console.log(preVdom, this.vdom);
  var patches = diff(preVdom, this.vdom);
  // console.log(patches);
  if (patches) {
    patch(this, this.$root, patches);
  } else {
    warn('不需要更新视图');
  }
  this._callHooks('updated');
  // 先父组件后子组件
  for (var c in this._components) {
    if (this._components.hasOwnProperty(c)) {
      this._components[c].update();
    }
  }
  return this;
};

function updateProps(component, props) {
  if (props) {
    for (var p in props) {
      if (props.hasOwnProperty(p)) {
        component.props[p.slice(1)] = props[p];
      }
    }
  }
  extend(component.state, component.props);
}

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

}());
//# sourceMappingURL=naive.js.map
