export const NodeTypes = {
  "VNODE": 1,
  "1": "VNODE",
  "VTEXT": 2,
  "2": "VTEXT",
  "VCOMPONENT": 3,
  "3": "VCOMPONENT"
}

export function isVNode (node) {
  return node.nodeType === NodeTypes['VNODE']
}

export function isVText (node) {
  return node.nodeType === NodeTypes['VTEXT']
}

export function isVComponent (node) {
  return node.nodeType === NodeTypes['VCOMPONENT']
}
