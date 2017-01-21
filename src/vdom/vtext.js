import { createTextNode } from '../dom';

// virtual text node
export default function VText (text) {
  this.data = text;
}

VText.prototype.render = function vdom2dom () {
  return createTextNode(this.data);
};
