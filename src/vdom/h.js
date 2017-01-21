import VNode from './vnode';

export default function h (tagName, props, children) {
  return new VNode(tagName, props, children);
}
