import { getObjectFromPath, setObjectFromPath } from '../parser'
import { isArray, deepClone } from '../utils'
import { attachEvent } from '../event'

export default {
  bind(element, binding, vdom) {
    const context = vdom
    const expression = binding.expression
    const tag = element.tagName.toLowerCase()
    const type = element.type
    if (tag === 'select') {
      attachEvent(element, 'change', function handleInput () {
        // 通过 path 设置 state
        const currentState = context.state
        if (element.multiple) {
          const options = element.options
          const newValue = []
          for (let i = 0; i < options.length; ++i) {
            if (options[i].selected) {
              newValue.push(options[i].value)
            }
          }
          setObjectFromPath(currentState, expression, newValue)
          context.setState(currentState)
        } else {
          setObjectFromPath(currentState, expression, element.value)
          context.setState(currentState)
        }
      })
    } else if (tag === 'input' && type === 'radio') {
      attachEvent(element, 'change', function handleChange(event) {
        const selectValue = event.currentTarget.value
        const currentState = context.state
        setObjectFromPath(currentState, expression, selectValue)
        context.setState(currentState)
      })
    } else if (tag === 'input' && type === 'checkbox') {
      attachEvent(element, 'change', function handleChange() {
        const selectValue = event.currentTarget.value
        const currentState = context.state
        const preValue = getObjectFromPath(currentState, expression)
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
    } else if (tag === 'textarea' || tag === 'input') {
      attachEvent(element, 'input', function handleInput () {
        // 通过 path 设置 state
        const currentState = context.state
        setObjectFromPath(currentState, expression, element.value)
        context.setState(currentState)
      })
    } else {
      // shit
    }
  },
  update(expression, element, context) {
    const currentValue = getObjectFromPath(context.state, expression)
    const tag = element.tagName.toLowerCase()
    const type = element.type
    if (tag === 'select') {
      selectUpdate(currentValue, element, context)
    } else if (tag === 'input' && type === 'radio') {
      inputRadioUpdate(currentValue, element, context)
    } else if (tag === 'input' && type === 'checkbox') {
      inputCheckboxUpdate(currentValue, element, context)
    } else if (tag === 'textarea' || tag === 'input') {
      inputTextareaUpdate(currentValue, element, context)
    } else {
      // not support
    }
  },
  unbind() {
  }
}

function selectUpdate(currentValue, element, context) {
  if (element.multiple) {
    const options = element.options
    for (let i = 0; i < options.length; ++i) {
      if (currentValue.indexOf(options[i].value) !== -1) {
        options[i].selected = true
      } else {
        options[i].selected = false
      }
    }
  } else {
    if (element.value !== currentValue) {
      element.value = currentValue
    }
  }
}

function inputRadioUpdate(currentValue, element, context) {
  element.checked = currentValue === element.value
}

function inputCheckboxUpdate(currentValue, element, context) {
  if (isArray(currentValue)) {
    element.checked = currentValue.indexOf(element.value) !== -1
  } else {
    element.checked = currentValue === element.value
  }
}

function inputTextareaUpdate(currentValue, element, context) {
  if (element.value !== currentValue) {
    element.value = currentValue
  }
}
