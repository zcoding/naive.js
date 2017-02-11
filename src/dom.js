import { isUndefined } from './utils';

/**
 * 获取元素
 *
 * IE 8 只支持到 CSS2 选择器
 *
 * @param {String} selector
 */
export function getElement(selector) {
  return typeof selector === 'string' ? query(selector) : selector;
}

export function createElement(tag) {
  return document.createElement(tag);
}

export function createTextNode (text) {
  return document.createTextNode(text);
}

export function createDocumentFragment () {
  return document.createDocumentFragment();
}

export function query(selector, context) {
  context = context || document;
  return context.querySelector(selector);
}

/**
 * 检查一个元素是否在 document 内
 */
export function inDoc(node) {
  var doc = node.ownerDocument.documentElement;
  return doc === node || node && node.nodeType === 1 && doc.contains(node);
}

export function removeNode(node) {
  const parentNode = node.parentNode;
  if (parentNode) {
    parentNode.removeChild(node);
  }
}

export function createAnchor(name) {
  var n = document.createTextNode('');
  n.name = name;
  return n;
}

export function before(newNode, node) {
  node.parentNode.insertBefore(newNode, node);
}

export function replaceNode(newNode, node) {
  node.parentNode.replaceChild(newNode, node);
}

export function after(el, target) {
  if (target.nextSibling) {
    before(el, target.nextSibling)
  } else {
    target.parentNode.appendChild(el)
  }
}

export function appendChild (el, target) {
  target.appendChild(el);
}

export function setAttr (node, attr, value) {
  node.setAttribute(attr, value);
}

export function hasAttr(node, name) {
  return node.hasAttribute(name);
}

export function removeAttr(node, name) {
  node.removeAttribute(name);
}

export function removeAllChildren(node) {
  while(node.childNodes.length > 0) {
    node.removeChild(node.childNodes[0]);
  }
}


const classSplitReg = /\s+/;

const supportClassList = !isUndefined(document.createElement('div').classList);

let getClasses = supportClassList ?
  function(element) {
    return Array.prototype.slice.call(element.classList);
  }
  :
  function(element) {
    return element.className.split(/\s+/).filter(s => s);
  };

export let hasClass = supportClassList ?
  function(element, classes) {
    classes = classes.split(/\s+/).filter(s => s);
    var contains = true;
    for (let i = 0; i < classes.length; ++i) {
      if (!element.classList.contains(classes[i])) {
        contains = false;
        break;
      }
    }
    return contains;
  }
  :
  function(element, classes) {
    classes = classes.split(/\s+/).filter(s => s);
    var contains = true, tmp = element.className;
    for (let i = 0; i < classes.length; ++i) {
      if (tmp.indexOf(classes[i]) === -1) {
        contains = false;
        break;
      }
    }
    return contains;
  };

export let addClass = supportClassList ?
  function(element, classes) {
    classes = classes.split(/\s+/).filter(s => s);
    element.classList.add.apply(element.classList, classes);
    return element;
  }
  :
  function(element, classes) {
    var tmp = element.className;
    classes = classes.split(/\s+/).filter(s => s);
    classes.forEach(c => {
      if (!hasClass(element, c)) {
        tmp = tmp.replace(/\s+|$/, ' ' + classes);
      }
    });
    element.className = tmp;
    return element;
  };

export let removeClass = supportClassList ?
  function(element, classes) {
    classes = classes.split(/\s+/).filter(s => s);
    element.classList.remove.apply(element.classList, classes);
    return element;
  }
  :
  function(element, classes) {
    var tmp = element.className;
    classes = classes.split(/\s+/).filter(s => s);
    classes.forEach(c => {
      if (hasClass(element, c)) {
        tmp = tmp.replace(new RegExp(c, 'g'), '');
      }
    });
    element.className = tmp;
    return element;
  };

export let toggleClass = supportClassList ?
  function(element, classes, force) {
    classes = classes.split(/\s+/).filter(s => s);
    classes.forEach(c => {
      element.classList.toggle(c, force);
    });
    return element;
  }
  :
  function(element, classes, force) {
    classes = classes.split(/\s+/).filter(s => s);
    var useForce = force !== undefined;
    classes.forEach(c => {
      if (hasClass(element, c) && (useForce && !force || !useForce)) {
        removeClass(element, c);
      } else if (!hasClass(element, c) && (useForce && force || !useForce)) {
        addClass(element, c);
      }
    });
    return element;
  };
