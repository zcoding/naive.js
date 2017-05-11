import { isUndefined } from './utils'

// 异步执行
// 如果 Promise 可用，就用 Promise，否则用 setTimeout
let resolved = !isUndefined(Promise) && Promise.resolve()
export const defer = resolved ? (f => { resolved.then(f) }) : setTimeout

let renderCallbacks = []

let nextTickCallbacks = []

let isDirty = false

export function nextTick(callback) {
  nextTickCallbacks.push(callback)
  if (renderCallbacks.length === 0) {
    defer(doNextTick)
  }
}

export function enqueueRender(component) {
  if (!component._dirty && (component._dirty = true) && renderCallbacks.push(component)===1) {
    isDirty = true
    defer(rerender)
  }
}

function doNextTick() {
  if (isDirty) {
    // wait for rendering
    return false
  }
  let p, list = nextTickCallbacks
  nextTickCallbacks = []
  while ((p = list.shift())) {
    p()
  }
}

function rerender() {
  let p, list = renderCallbacks
  renderCallbacks = []
  while ( (p = list.pop()) ) {
    if (p._dirty) {
      p.$update()
    }
  }
  isDirty = false
  doNextTick()
}
