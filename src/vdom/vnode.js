import { createElement, setAttr, appendChild } from '../dom';
import VText from './vtext';
import { isVNode, isVText } from './utils';

export default function VNode (tagName, props, children, key) {
  this.tagName = tagName;
  this.props = props || {};
  this.key = key ? String(key) : undefined; // key 用来标识节点，方便 diff
  const childNodes = [];
  children = children || [];
  for (let i = 0; i < children.length; ++i) {
    const child = children[i];
    if (isVNode(child) || isVText(child)) {
      childNodes.push(child);
    } else if (typeof child === 'string') {
      childNodes.push(new VText(child));
    } else {
      // error
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
        attachEvent(el, eventName, function handler(evt) {
          props[p].call(context, evt);
        });
      } else {
        // 处理指令
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
