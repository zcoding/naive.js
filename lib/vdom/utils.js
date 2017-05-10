import VText from './vtext'
import VNode from './vnode'
import Naive from '../main'

export function isVNode (node) {
  return node instanceof VNode
}

export function isVText (node) {
  return node instanceof VText
}

export function isVComponent (node) {
  return node instanceof Naive
}
