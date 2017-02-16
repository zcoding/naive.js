import { createElement, setAttr, appendChild } from '../dom';
import VText from './vtext';
import { isVNode, isVText, isVComponent } from './utils';
import { isArray, isFunction, warn } from '../utils';
import { handleDirective } from '../directive';
import { attachEvent } from '../event';

export default function VNode (tagName, props, children, key) {
  this.tagName = tagName;
  this.props = props || {};
  this.key = key ? String(key) : undefined; // key 用来标识节点，方便 diff
  let childNodes = [];
  children = children || [];
  for (let i = 0; i < children.length; ++i) {
    const child = children[i];
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
  let count = this.children.length;
  for (let i = 0; i < this.children.length; ++i) {
    count += this.children[i].count || 0;
  }
  this.count = count; // 记录子节点数，在 patch 的时候找到节点位置
}

// 检查是否指令属性
function checkAttrDirective (attr) {
  return /^@|n-|:/.test(attr);
}

// add event listener
function isEventDirective (attr) {
  return /^@/.test(attr);
}

VNode.prototype.render = function renderVNodeToElement(context) {
  const element = createElement(this.tagName);
  const props = this.props;
  for (let p in props) {
    if (props.hasOwnProperty(p)) {
      if (/^n-/.test(p)) {
        handleDirective(p.slice(2), props[p], element, context);
      } else if (/^:/.test(p)) {
        handleDirective(p.slice(1), props[p], element, context);
      } else if (/^@/.test(p)) {
        const eventName = p.slice(1);
        const handlerFunc = isFunction(props[p]) ? props[p] : context[props[p]];
        attachEvent(element, eventName, function handler(evt) {
          handlerFunc.call(context, evt);
        });
      } else {
        setAttr(element, p, props[p]);
      }
    }
  }
  for (let i = 0; i < this.children.length; ++i) {
    appendChild(this.children[i].render(context), element);
  }
  return element;
};
