import VNode from './vnode'
import VText from './vtext'
import { isArray, isPlainObject } from '../utils'
import { isVNode, isVText, isVComponent } from './utils'
import DynamicComponent from '../api/component'

// create VNode, VText, VComponent
// @TODO 需要增强参数
export default function h (tagName, props, children, key) {
  const context = this || {}
  const components = context['components'] || {}
  if (isVNode(tagName) || isVText(tagName) || isVComponent(tagName)) {
    return tagName
  } else if (isPlainObject(tagName)) {
    if (components.hasOwnProperty(tagName.tagName)) {
      // 可能是 props 或者 attrs
      return components[tagName.tagName](tagName.props || tagName.attrs, tagName.children, tagName.key)
    } else {
      return new VNode(tagName.tagName, tagName.attrs, tagName.children, tagName.key)
    }
  } else if (isArray(tagName)) {
    const list = []
    for (let i = 0; i < tagName.length; ++i) {
      list.push(h(tagName[i]))
    }
    return list
  } else if(arguments.length < 2) {
    return new VText(tagName)
  } else {
    if (components.hasOwnProperty(tagName)) {
      return components[tagName](props, children, key)
    } else {
      return new VNode(tagName, props, children, key)
    }
  }
}
