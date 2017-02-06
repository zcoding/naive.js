import VNode from './vnode';
import VText from './vtext';
import { isArray } from '../utils';
import { isVNode, isVText } from './utils';

export default function h (tagName, props, children, key) {
  if (isVNode(tagName) || isVText(tagName)) {
    return tagName;
  } else if (isArray(tagName)) {
    const list = [];
    for (let i = 0; i < tagName.length; ++i) {
      list.push(h(tagName[i]));
    }
    return list;
  } else if(arguments.length < 2) {
    return new VText(tagName);
  } else {
    return new VNode(tagName, props, children, key);
  }
}
