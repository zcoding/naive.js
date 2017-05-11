import VNode from './vnode'
import VText from './vtext'
import { isArray, isPlainObject, deepExtend } from '../utils'
import { isVNode, isVText, isVComponent } from './node-types'
import DynamicComponent from '../api/component'

function updateProps (component, props) {
  const combineProps = {}
  if (props) {
    for (let p in props) {
      if (props.hasOwnProperty(p)) {
        component.props[p] = props[p]
        if (/^:/.test(p)) {
          combineProps[p.slice(1)] = props[p]
        } else {
          combineProps[p] = String(props[p])
        }
      }
    }
  }
  deepExtend(component.state, combineProps)
}

// create vdom
// @TODO 需要增强参数
export default function h (tagName, props, children, key) {
  const context = this || {}
  const components = context['components'] || {}
  if (isVNode(tagName) || isVText(tagName) || isVComponent(tagName)) {
    return tagName
  } else if (isPlainObject(tagName)) {
    if (components.hasOwnProperty(tagName.tagName)) {
      const componentProps = tagName.props || tagName.attrs
      // 如果是已生成的组件，不要重新生成
      const _components = context['_components'] || {}
      if (_components[tagName.key]) {
        updateProps(_components[tagName.key], componentProps)
        return _components[tagName.key]
      } else {
        // 可能是 props 或者 attrs
        return components[tagName.tagName](componentProps, tagName.children, tagName.key)
      }
    } else {
      return new VNode(tagName.tagName, tagName.attrs, tagName.children, tagName.key)
    }
  } else if (isArray(tagName)) {
    const list = []
    for (let i = 0; i < tagName.length; ++i) {
      list.push(h(tagName[i]))
    }
    return list
  } else if(arguments.length < 2) {
    return new VText(tagName)
  } else {
    if (components.hasOwnProperty(tagName)) {
      const _components = context['_components'] || {}
      if (_components[key]) {
        updateProps(_components[key], props)
        return _components[key]
      } else {
        return components[tagName](props, children, key)
      }
    } else {
      return new VNode(tagName, props, children, key)
    }
  }
}
