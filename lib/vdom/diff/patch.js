import { setAttr, replaceNode, removeNode, removeAttr } from '../../dom'
import { handleDirective, handleDirectiveRemove } from '../../directive'
import { domIndex } from './dom-index'
import { isVComponent } from '../node-types'
import { isUndefined } from '../../utils'
import { callHooks } from '../../api/hooks'

export const PATCH = {
  REPLACE: 0, // 替换节点
  INSERT: 1, // 插入
  REMOVE: 2, // 移除
  REORDER: 3, // 重排
  PROPS: 4, // 修改属性
  TEXT: 5, // 替换文本
  COMPONENT: 6 // 组件 patch
};

function ascending(a, b) {
  return a > b ? 1 : -1;
}

// 移除节点
// 如果是 DOM 节点，调用 removeNode
// 如果是组件节点，调用 $destroy
// 先删子节点，递归删除
function doRemoveNode(domNode, target) {
  if (isVComponent(target)) {
    target.$destroy() // 注意已经 destroyed 下次要重新生成
  } else if (target.children) {
    for (let i = 0; i < target.children.length; ++i) {
      doRemoveNode(domNode.childNodes[i], target.children[i])
    }
  }
  removeNode(domNode)
}

// 根据补丁更新 DOM 节点
function doApplyPatches (context, domNode, patches) {
  for (let i = 0; i < patches.length; ++i) {
    const patch = patches[i]
    switch (patch.type) {
      case PATCH.REPLACE: // 替换元素节点
        replaceNode(patch.node.$render(context), domNode)
        break
      case PATCH.PROPS: // 属性修改
        patchProps(domNode, patch, context)
        break
      case PATCH.TEXT: // 替换文本内容
        domNode.data = patch.data
        break
      case PATCH.REORDER: // 子节点重新排序
        patchReorder(context, domNode, patch.moves)
        break
      case PATCH.INSERT:
        if (isVComponent(patch.node)) { // 插入组件
          const childComponent = patch.node
          callHooks.call(childComponent, 'beforeMount')
          const $root = childComponent.$render()
          domNode.appendChild($root)
          callHooks.call(childComponent, 'mounted', [$root])
        } else { // 插入节点
          if (domNode) {
            domNode.appendChild(patch.node.$render(context))
          } else {
            // 如果节点不存在了，不需要执行插入操作
          }
        }
        break
      case PATCH.REMOVE:
        doRemoveNode(domNode, patch.node)
        break
      case PATCH.COMPONENT:
        if (patch.pVdom.key === patch.nVdom.key) {
          patch.pVdom.$update()
        } else {
          const $root = patch.pVdom.$root
          patch.pVdom.$destroy()
          patch.nVdom.$mount($root)
        }
        break
      default:
        // warn
    }
  }
}

export function applyPatch (context, domNode, patch) {
  const patches = patch.patches
  // 先找需要 patch 的 dom 节点
  const indices = []
  for (let p in patches) {
    if (patches.hasOwnProperty(p)) {
      indices.push(+p) // 一定要转成数字
    }
  }
  indices.sort(ascending)
  let pVdom = patch.pVdom
  const domMapping = domIndex(domNode, pVdom, indices)
  for (let i = 0; i < indices.length; ++i) {
    const idx = indices[i]
    doApplyPatches(context, domMapping[idx], patches[idx])
  }
}

function patchReorder (context, domNode, moves) {
  const removes = moves.removes
  const inserts = moves.inserts
  const childNodes = domNode.childNodes
  const keyMap = {}
  // 先删除
  for (let i = 0; i < removes.length; ++i) {
    const remove = removes[i]
    const toRemove = childNodes[remove.from]
    if (remove.key) { // 需要保留，等待重新插入
      keyMap[remove.key] = toRemove
    }
    removeNode(toRemove)
  }
  // 后插入
  for (let i = 0; i < inserts.length; ++i) {
    const insert = inserts[i]
    const target = insert.to < childNodes.length ? childNodes[insert.to] : null
    const toInsert = keyMap[insert.key]
    domNode.insertBefore(toInsert, target)
  }
}

// 检查是否指令属性
function isAttrDirective (attr) {
  return /^@|n-|:/.test(attr)
}
// 检查是否事件指令
function isEventDirective (attr) {
  return /^@/.test(attr)
}

function patchProps (domNode, patch, context) {
  const setProps = patch.props.set;
  const removeProps = patch.props.remove;
  for (let p in setProps) {
    if (setProps.hasOwnProperty(p)) {
      // 检查是否指令属性
      if (isAttrDirective(p)) {
        // 处理指令
        if (/^n-/.test(p)) {
          handleDirective(p.slice(2), setProps[p], domNode, context);
        } else if (/^:/.test(p)) {
          handleDirective(p.slice(1), setProps[p], domNode, context);
        } else {
          // 事件不处理
        }
      } else { // 普通属性
        if (isUndefined(patch.props[p])) {
          removeAttr(domNode, p);
        } else {
          setAttr(domNode, p, patch.props[p]);
        }
      }
    }
  }
  // @TODO remove 错误
  for (let p in removeProps) {
    if (removeProps.hasOwnProperty(p)) {
      if (isAttrDirective(p)) {
        if (/^n-/.test(p)) {
        } else if (/^:/.test(p)) {
          handleDirectiveRemove(p.slice(1), removeProps[p], domNode, context);
        } else {
        }
      }
    }
  }
}
