import { createElement } from '../dom';
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
}

VNode.prototype.render = function vdom2dom() {
  const el = createElement(this.tagName);
  const props = this.props;
  for (let p in props) {
    el.setAttribute(p, props[p]);
  }
  for (let i = 0; i < this.children.length; ++i) {
    el.appendChild(this.children[i].render());
  }
  return el;
};
