import { setAttr, replaceNode } from '../dom';
import { handleDirective } from '../directive';

export const PATCH = {
  REPLACE: 0, // 替换节点
  INSERT: 1, // 插入
  REMOVE: 2, // 移除
  REORDER: 3, // 重排
  PROPS: 4, // 修改属性
  TEXT: 5 // 替换文本
};

export function patch (context, domNode, patches) {
  const walker = {index: 0};
  dfsWalk(context, domNode, walker, patches);
}

function dfsWalk (context, domNode, walker, patches) {
  const currentPatches = patches[walker.index];

  const len = domNode.childNodes ? domNode.childNodes.length : 0;
  for (let i = 0; i < len; i++) {
    const child = domNode.childNodes[i];
    walker.index++;
    dfsWalk(context, child, walker, patches);
  }
  if (currentPatches) {
    applyPatches(context, domNode, currentPatches);
  }
}

function patchReorder (context, domNode, moves) {
  for (let i = 0; i < moves.length; ++i) {
    const move = moves[i];
    switch (move.type) {
      case PATCH.INSERT: // 插入新节点
        const target = domNode.childNodes[move.index] || null; // null 插入末尾
        domNode.insertBefore(move.item.render(context), target);
        break;
      case PATCH.REMOVE:
        removeNode(domNode.childNodes[move.index]);
        break;
      default:
        // error type
    }
  }
}

// 检查是否指令属性
function isAttrDirective (attr) {
  return /^@|n-|:/.test(attr);
}
// 检查是否事件指令
function isEventDirective (attr) {
  return /^@/.test(attr);
}

function patchProps (domNode, patch, context) {
  for (let p in patch.props) {
    if (patch.props.hasOwnProperty(p)) {
      // 检查是否指令属性
      if (isAttrDirective(p)) {
        if (isEventDirective(p)) {
          // removeEventListener
          // addEventListener
        } else { // 其他指令属性
          // 处理指令
          if (/^n-/.test(p)) {
            handleDirective(p.slice(2), patch.props[p], domNode, context);
          } else if (/^:/.test(p)) {
            handleDirective(p.slice(1), patch.props[p], domNode, context);
          } else {}
        }
      } else { // 普通属性
        setAttr(domNode, p, patch.props[p]);
      }
    }
  }
}

// 根据补丁更新 DOM 节点
function applyPatches (context, domNode, patches) {
  for (let i = 0; i < patches.length; ++i) {
    const patch = patches[i];
    switch (patch.type) {
      case PATCH.REPLACE: // 替换元素节点
        replaceNode(patch.node.render(context), domNode);
        break;
      case PATCH.PROPS: // 属性修改
        patchProps(domNode, patch, context);
        break;
      case PATCH.TEXT: // 替换文本内容
        domNode.data = patch.data;
        break;
      case PATCH.REORDER: // 子节点重新排序
        patchReorder(context, domNode, patch.moves);
        break;
      default:
        // warn
    }
  }
}
