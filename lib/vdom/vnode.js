import { createElement, setAttr, appendChild } from '../dom'
import { isVComponent } from './node-types'
import { isArray } from '../utils'
import { handleDirective, bindDirective } from '../directive'
import { attachEvent } from '../event'
import { NaiveException } from '../exception'
import { getObjectFromPath } from '../parser'
import h from './h'
import { callHooks } from '../api/hooks'
import { NodeTypes } from './node-types'

export default function VNode (tagName, props, children, key) {
  this.nodeType = NodeTypes['VNODE']
  this.tagName = tagName
  this.props = props || {}
  this.key = key ? String(key) : undefined // key 用来标识节点，方便 diff
  let childNodes = []
  children = children || []
  for (let i = 0; i < children.length; ++i) {
    const child = children[i]
    if (isArray(child)) {
      childNodes = childNodes.concat(h.call(this, child))
    } else {
      if (child !== false) {
        childNodes.push(h.call(this, child))
      }
    }
  }
  this.children = childNodes
  let count = this.children.length
  for (let i = 0; i < this.children.length; ++i) {
    count += this.children[i].count || 0
  }
  this.count = count // 记录子节点数，在 patch 的时候找到节点位置
}

// vdom => dom
VNode.prototype.$render = function renderVNodeToElement(context) {
  const element = createElement(this.tagName)
  const props = this.props
  const nodeContext = this
  for (let p in props) {
    if (props.hasOwnProperty(p)) {
      if (/^n-/.test(p)) {
        bindDirective(p.slice(2), props[p], element, context)
        handleDirective(p.slice(2), props[p], element, context)
      } else if (/^:/.test(p)) {
        handleDirective(p.slice(1), props[p], element, context)
      } else if (/^@/.test(p)) {
        const eventName = p.slice(1)
        const handler = props[p]
        attachEvent(element, eventName, handler)
      } else {
        setAttr(element, p, props[p])
      }
    }
  }
  for (let i = 0; i < this.children.length; ++i) {
    const child = this.children[i]
    // @TODO 重新生成 vdom 的时候不应该总是重新生成 VComponent
    if (isVComponent(child)) {
      callHooks.call(child, 'beforeMount')
      const $root = child.$render()
      appendChild($root, element)
      callHooks.call(child, 'mounted', [$root])
    } else {
      appendChild(child.$render(context), element)
    }
  }
  return element
}
