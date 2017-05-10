export function attachEvent (el, eventName, handler) {
  if (el.addEventListener) {
    el.addEventListener(eventName, handler, false)
  } else if (el.attachEvent) {
    el.attachEvent(eventName, handler)
  }
}

export function detachEvent (el, eventName, handler) {
  if (el.removeEventListener) {
    el.removeEventListener(eventName, handler, false)
  } else if (el.detachEvent) {
    el.detachEvent(eventName, handler)
  }
}
