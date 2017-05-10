import { createTextNode } from '../dom'

// virtual text node
export default function VText (text) {
  this.data = text
}

VText.prototype.render = function renderVTextToTextNode () {
  return createTextNode(this.data)
}
