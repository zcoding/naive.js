import { setAttr, removeAttr, removeClass } from './dom'
import { isArray, isString, deepClone } from './utils'
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
      model(value, element, context)
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

export function bindDirective (directive, value, element, context) {
  switch (directive) {
    case 'model':
      if (element.type === 'radio') {
        attachEvent(element, 'change', function handleChange(event) {
          const selectValue = event.currentTarget.value
          const currentState = deepClone(context.state)
          setObjectFromPath(currentState, value, selectValue)
          context.setState(currentState)
        })
      } else if (element.type === 'checkbox') {
        attachEvent(element, 'change', function handleChange() {
          const selectValue = event.currentTarget.value
          const currentState = deepClone(context.state)
          const preValue = getObjectFromPath(currentState, value)
          if (event.currentTarget.checked) {
            if (preValue.indexOf(selectValue) === -1) {
              preValue.push(selectValue)
            }
          } else {
            let i = 0
            while(i < preValue.length) {
              if (preValue[i] === selectValue) {
                preValue.splice(i, 1)
                break
              }
              ++i
            }
          }
          context.setState(currentState)
        })
      } else if (element.tagName === 'SELECT') {
        attachEvent(element, 'change', function handleInput () {
          // 通过 path 设置 state
          const currentState = deepClone(context.state)
          if (element.multiple) {
            const options = element.options
            const newValue = []
            for (let i = 0; i < options.length; ++i) {
              if (options[i].selected) {
                newValue.push(options[i].value)
              }
            }
            setObjectFromPath(currentState, value, newValue)
            context.setState(currentState)
          } else {
            setObjectFromPath(currentState, value, element.value)
            context.setState(currentState)
          }
        })
      } else {
        attachEvent(element, 'input', function handleInput () {
          // 通过 path 设置 state
          const currentState = deepClone(context.state)
          setObjectFromPath(currentState, value, element.value)
          context.setState(currentState)
        })
      }
      break
    default:
  }
}

function removeClassAttr (removeValue, element, context) {
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
      removeClassAttr(value, element, context)
      break
  }
}
