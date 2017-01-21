import VText from './vtext';
import VNode from './vnode';

export function isVNode (node) {
  return node instanceof VNode;
}

export function isVText (node) {
  return node instanceof VText;
}
