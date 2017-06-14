import { setAttr, removeAttr, removeClass } from './dom'
import { isArray, isString } from './utils'
import staticClass from './directives/class'
import show from './directives/show'
import style from './directives/style'
import model from './directives/model'
import { attachEvent } from './event'
import { getObjectFromPath, setObjectFromPath } from './parser'

const HtmlBooleanAttributes = ['disabled', 'checked', 'selected']

export function handleDirective (directive, value, element, context) {
  switch (directive) {
    case 'show':
      show(value, element, context)
      break
    case 'staticClass':
      staticClass(value, element, context)
      break
    case 'style':
      style(value, element, context)
      break
    case 'model':
      model.update(value, element, context)
      break
    default:
      if (HtmlBooleanAttributes.indexOf(directive) !== -1) {
        if (value) {
          setAttr(element, directive, directive)
        } else {
          removeAttr(element, directive)
        }
      } else {
        setAttr(element, directive, value)
      }
      break
  }
}

function bindDirectiveModel(options) {
  model.bind(options.element, options, options.context)
}

function bindDirectiveBind(options) {
  const element = options.element
  element.setAttribute(options.argument, options.expression)
}

function bindDirectiveOn(options) {
  attachEvent(options.element, options.argument, function handler() {
    options.expression.call(options.context)
  })
}

function bindDirectiveShow(options) {
  options.element.style.display = options.expression ? '' : 'none'
}

function bindDirectiveText(options) {}

export function bindDirective(options) {
  switch (options.name) {
    case 'model':
      bindDirectiveModel(options)
      break
    case 'bind':
      bindDirectiveBind(options)
      break
    case 'on':
      bindDirectiveOn(options)
      break
    case 'show':
      bindDirectiveShow(options)
      break
    case 'text':
      bindDirectiveText(options)
      break
    default:
      // what the fuck ?
  }
}

function removeStaticClass (removeValue, element, context) {
  if (isString(removeValue)) {
    removeClass(element, removeValue)
  } else if (isArray(removeValue)) {
    removeClass(element, removeValue.join(' '))
  } else {
    for (let c in removeValue) {
      if (removeValue.hasOwnProperty(c)) {
        removeClass(element, c)
      }
    }
  }
}

export function handleDirectiveRemove (directive, value, element, context) {
  switch (directive) {
    case 'staticClass':
      removeStaticClass(value, element, context)
      break
  }
}
