import { extend } from '../utils';
import { createDocumentFragment, replaceNode } from './dom';

export default function VComponent (name, options) {
  this.name = name;
  this.key = 'key' in options ? String(options.key) : undefined;
  this.components = options.components || {};
  this.vdomRender = options.render;
  this.vdom = this.vdomRender();
}

const prtt = VComponent.prototype;

prtt.mount = function mount (domNode) {
  this.ele = domNode;
  replaceNode(this.render(), domNode);
  this.mounted = true;
};

prtt.render = function render () {
  if (isArray(this.vdom)) {
    const docFragment = createDocumentFragment();
    for (let i = 0; i < this.vdom.length; ++i) {
      docFragment.appendChild(this.vdom[i].render(this));
    }
    return docFragment;
  } else {
    return this.vdom.render(this);
  }
};

prtt.update = function update () {
  if (!this.mounted) { // 如果组件没有挂载到元素上，不需要更新视图
    return this;
  }
  const preVdom = this.vdom;
  this.vdom = this.vdomRender(); // update vdom
  // console.log(preVdom, this.vdom);
  const patches = diff(preVdom, this.vdom);
  // console.log(patches);
  if (patches) {
    patch(this, this.ele, patches);
  } else {
    warn('不需要更新视图');
  }
};

prtt.setState = function setState (state) {
  extend(this.state, state);
  this.update();
  return this;
};
