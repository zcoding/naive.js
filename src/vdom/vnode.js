import { createElement, setAttr, appendChild } from '../dom';
import VText from './vtext';
import { isVNode, isVText } from './utils';
import { isArray, isFunction } from '../utils';
import { handleDirective } from '../directive';

export default function VNode (tagName, props, children, key) {
  this.tagName = tagName;
  this.props = props || {};
  this.key = key ? String(key) : undefined; // key 用来标识节点，方便 diff
  let childNodes = [];
  children = children || [];
  for (let i = 0; i < children.length; ++i) {
    const child = children[i];
    if (isVNode(child) || isVText(child) || child._isComponent) {
      childNodes.push(child);
    } else if (typeof child === 'string') {
      childNodes.push(new VText(child));
    } else if (isArray(child)) {
      childNodes = childNodes.concat(child);
    } else {
      // ignore
    }
  }
  this.children = childNodes;
  let count = this.children.length;
  for (let i = 0; i < this.children.length; ++i) {
    count += this.children[i].count || 0;
  }
  this.count = count; // 记录子节点数，方便 patch 的时候找到节点位置
}

// 检查是否指令属性
function checkAttrDirective (attr) {
  return /^@|n-|:/.test(attr);
}

// add event listener
function isEventDirective (attr) {
  return /^@/.test(attr);
}

function attachEvent (el, eventName, handler) {
  if (el.addEventListener) {
    el.addEventListener(eventName, handler, false);
  } else if (el.attachEvent) {
    el.attachEvent(eventName, handler);
  } else {
    el[`on${eventName}`] = handler;
  }
}

function detachEvent () {}

VNode.prototype.render = function vdom2dom(context) {
  const el = createElement(this.tagName);
  const props = this.props;
  for (let p in props) {
    if (checkAttrDirective(p)) {
      if (isEventDirective(p)) {
        const eventName = p.slice(1);
        const handlerFunc = isFunction(props[p]) ? props[p] : context[props[p]];
        attachEvent(el, eventName, function handler(evt) {
          handlerFunc.call(context, evt);
        });
      } else {
        // 处理指令
        if (/^n-/.test(p)) {
          handleDirective(p.slice(2), props[p], el, context);
        } else if (/^:/.test(p)) {
          handleDirective(p.slice(1), props[p], el, context);
        } else {}
      }
    } else {
      setAttr(el, p, props[p]);
    }
  }
  for (let i = 0; i < this.children.length; ++i) {
    appendChild(this.children[i].render(context), el);
  }
  return el;
};
