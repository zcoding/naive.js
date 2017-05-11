import { createTextNode } from '../dom'
import { NodeTypes } from './node-types'

// virtual text node
export default function VText (text) {
  this.nodeType = NodeTypes['VTEXT']
  this.data = text
}

VText.prototype.$render = function renderVTextToTextNode () {
  return createTextNode(this.data)
}
