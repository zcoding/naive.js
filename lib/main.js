import { getElement, appendChild, replaceNode, removeNode } from './dom'
import { diff } from './vdom/diff/diff'
import { applyPatch } from './vdom/diff/patch'
import h from './vdom/h'
import { NodeTypes, isVComponent } from './vdom/node-types'
import { warn, deepExtend, simpleExtend, deepClone, isFunction, isString, isPlainObject, toArray, isArray, isUndefined } from './utils'
import { addHook, removeHook, callHooks } from './api/hooks'
import { enqueueRender, nextTick as nextTickDefer } from './defer'
import { NaiveException } from './exception'

let componentId = 1

// _init => 首次生成 vdom
// $update => 重新生成 vdom => diff => patches => 更新 dom（不会重新生成 $root）
// $render => vdom => 调用 vdom 的 $render 生成 dom（第一次调用 $render 之后才会有 $root）
// $mount => $render => 将 $root 挂载到页面
// setState => 更新 state 但不会立即更新 vdom => $update 此时才会更新

// 因为是在应用内生成的组件，所以不需要用 uuid 算法，只需要保证在应用内唯一即可
// componentId 保证 component 类型的唯一性，时间戳保证组件唯一性
function uuid() {
  return '$naive-component-' + componentId++ + '-' + new Date().getTime()
}

function emptyRender (h) {
  return h('')
}

export default function Naive (options) {
  this.nodeType = NodeTypes['VCOMPONENT']
  options = options || {}
  this.name = options.name || ''
  this.key = options.key || uuid()
  // @TODO 重复初始化？
  // debugger
  this._hooks = {}
  if (options.hasOwnProperty('state')) {
    if (!isFunction(options.state)) {
      throw new NaiveException('state should be [Function]')
    }
    const _state = options.state()
    if (isPlainObject(_state)) {
      this.state = _state
    } else {
      throw new NaiveException('state() must return [Plain Object]')
    }
  } else {
    this.state = {}
  }
  this.props = {}
  const combineProps = {}
  // 合并 state 和 options.props
  if (options.props) {
    for (let p in options.props) {
      if (options.props.hasOwnProperty(p)) {
        this.props[p] = options.props[p]
        if (/^:/.test(p)) {
          combineProps[p.slice(1)] = options.props[p]
        } else {
          combineProps[p] = String(options.props[p])
        }
      }
    }
  }
  deepExtend(this.state, combineProps)
  callHooks.call(this, 'beforeCreate')
  const context = this
  const _vdomRender = options.render || emptyRender
  const _templateHelpers = {
    "if": function (condition, options) {
      return condition ? h.call(context, options) : false
    },
    "each": function (list, iteratorCount, createItem) {
      const nodes = []
      if (isArray(list)) {
        for (let i = 0; i < list.length; ++i) {
          const item = list[i]
          const _itemUid = isPlainObject(item) && 'id' in item ? item['id'] : i
          let params = [item, _itemUid]
          if (iteratorCount === 2) {
            params = [item, i, _itemUid]
          } else if (iteratorCount === 3) {
            params = [item, i, i, _itemUid]
          }
          nodes.push(h(createItem.apply(context, params)))
        }
      } else {
        let idx = 0
        for (let p in list) {
          if (list.hasOwnProperty(p)) {
            const item = list[p]
            const _itemUid = isPlainObject(item) && 'id' in item ? item['id'] : p
            let params = [item, _itemUid]
            if (iteratorCount === 2) {
              params = [item, p, _itemUid]
            } else if (iteratorCount === 3) {
              params = [item, p, idx, _itemUid]
            }
            nodes.push(h(createItem.apply(context, params)))
            idx++
          }
        }
      }
      return nodes
    }
  }
  this.$vdomRender = function $vdomRender () {
    const vdom = _vdomRender.call(
      this,
      function createVdom () {
        return h.apply(context, toArray(arguments))
      },
      _templateHelpers
    )
    return vdom
  }
  this.$root = null // 第一次 $render 之后才会生成 $root
  this.components = {} // 组件描述对象列表
  this._components = {} // 组件实例映射
  const componentsOptions = options.components || {}
  for (let p in componentsOptions) {
    if (componentsOptions.hasOwnProperty(p)) {
      const componentDefine = componentsOptions[p] || {}
      componentDefine.name = componentDefine.name || p
      componentDefine.parent = this
      this.components[p] = createComponentCreator(this, componentDefine)
    }
  }
  this.parent = options.parent || null
  this._init(options)
  callHooks.call(this, 'created')
}

function createComponentCreator (context, componentDefine) {
  return function createComponent(props, children, key) {
    const newChild = new Naive(deepExtend({}, componentDefine, {props,  key}))
    context._components[key] = newChild
    return newChild
  }
}

const prtt = Naive.prototype

prtt._init = function _init (options) {
  const methods = options.methods || {}
  // 将 methods 移到 this
  for (let m in methods) {
    if (methods.hasOwnProperty(m)) {
      if (this.hasOwnProperty(m)) {
        warn(`属性 "${m}" 已存在`)
      } else {
        this[m] = methods[m]
      }
    }
  }
  const hooks = options.hooks || {}
  for (let p in hooks) {
    if (hooks.hasOwnProperty(p)) {
      addHook.call(this, p, hooks[p])
    }
  }
  if (options.init) {
    options.init.call(this)
  }
  this.$vdom = this.$vdomRender()
}

prtt.setState = function setState (state) {
  if (state === this.state) {
    throw new NaiveException('Never do `setState` with `this.state`')
  }
  simpleExtend(this.state, state)
  enqueueRender(this)
  return this
}

// update view: state => vdom => diff => patches => dom
prtt.$update = function $update () {
  if (!this.$root) {
    return this
    // throw new NaiveException('VComponent must be mounted before update')
  }
  // console.log(this)
  callHooks.call(this, 'beforeUpdate', [deepClone(this.state)])
  const preVdom = this.$vdom
  this.$vdom = this.$vdomRender()
  // console.log(preVdom, this.$vdom)
  const patches = diff(preVdom, this.$vdom)
  // console.log(patches)
  applyPatch(this, this.$root, patches)
  callHooks.call(this, 'updated', [deepClone(this.state)])
  this._dirty = false
  return this
}

prtt.$nextTick = function $nextTick(callback) {
  nextTickDefer(callback)
}

// render view: vdom => dom
prtt.$render = function $render () {
  this.$root = this.$vdom.$render(this)
  return this.$root
}

// mount
prtt.$mount = function $mount (selector) {
  const mountPoint = isString(selector) ? getElement(selector) : selector
  if (!mountPoint) {
    throw new NaiveException('Mount point not found')
  }
  callHooks.call(this, 'beforeMount')
  const $root = this.$render()
  replaceNode($root, mountPoint)
  callHooks.call(this, 'mounted', [$root])
}

function doDestroy(vdom) {
  if (isVComponent(vdom)) {
    vdom.$destroy()
  } else if (vdom.children) {
    for (let i = 0; i < vdom.children.length; ++i) {
      doDestroy(vdom.children[i])
    }
  }
}

prtt.$destroy = function $destroy () {
  if (!this.$root) {
    return this
  }
  const vdom = this.$vdom
  for (let i = 0; i < vdom.children.length; ++i) {
    doDestroy(vdom.children[i])
  }
  callHooks.call(this, 'beforeDestroy')
  this.$root = null // 释放 dom 节点
  // 销毁事件监听
  callHooks.call(this, 'destroyed')
  // 销毁勾子回调
  for (let p in this._hooks) {
    if (this._hooks.hasOwnProperty(p)) {
      removeHook.call(this, p)
    }
  }
  // 从父组件的 _components 中移除
  if (this.parent) {
    if (this.parent._components.hasOwnProperty(this.key)) {
      delete this.parent._components[this.key]
    }
  }
}
