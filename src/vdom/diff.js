import { isVNode, isVText } from './utils';
import listDiff from './list-diff';
import { PATCH } from './patch';
import { isArray, isPlainObject } from '../utils';

// diff two vdom node
export function diff (oldTree, newTree) {
  let index = 0;
  let patches = {};
  if (isArray(oldTree)) {
    const currentPatches = [];
    diffChildren(oldTree, newTree, 0, patches, currentPatches);
    if (currentPatches.length) {
      patches[0] = currentPatches;
    }
  } else {
    diffWalk(oldTree, newTree, index, patches);
  }
  return patches;
}

function diffWalk (pNode, nNode, index, patches) {
  let currentPatches = []; // 当前层级的 patch
  if (nNode === null) {
    // 这种情况属于：在 diffChildren 的时候该节点被标识为被删除的节点，但是不需要在这里删除（在 reorder 的时候会处理删除）
  } else if (isVNode(pNode) && isVNode(nNode)) { // 都是 VNode
    if (pNode.tagName !== nNode.tagName || pNode.key !== nNode.key) { // 不同节点，或者已标识不是同一节点，要替换
      currentPatches.push({type: PATCH.REPLACE, node: nNode});
    } else {
      let propsPatches = diffProps(pNode, nNode);
      if (propsPatches) {
        currentPatches.push({type: PATCH.PROPS, props: propsPatches.set, removeProps: propsPatches.remove});
      }
      // 继续 diff 子节点
      diffChildren(pNode.children, nNode.children, index, patches, currentPatches);
    }
  } else if (isVText(pNode) && isVText(nNode)) { // 都是 VText
    if (pNode.data !== nNode.data) { // 内容不一样的时候才替换（只替换内容即可）
      currentPatches.push({type: PATCH.TEXT, data: nNode.data});
    }
  } else if (pNode._isComponent && nNode._isComponent) { // 都是组件
  } else { // 类型不一样，绝对要替换
    currentPatches.push({type: PATCH.REPLACE, node: nNode});
  }
  if (currentPatches.length) {
    patches[index] = currentPatches;
  }
}

// 快速比较两个对象是否“相等”
function objectEquals (a, b) {
  return JSON.stringify(a) === JSON.stringify(b);
}

function diffProps (oldTree, newTree) {
  let oldTreeProps = oldTree.props;
  let newTreeProps = newTree.props;
  let setPropsPatches = {}, removePropsPatches = {}, hasPatch = false;
  for (let p in oldTreeProps) {
    if (!newTreeProps.hasOwnProperty(p) || typeof newTreeProps[p] === 'undefined') { // 属性被移除
      hasPatch = true;
      removePropsPatches[p] = oldTreeProps[p];
    } else if (isPlainObject(newTreeProps[p])) {
      if (!objectEquals(newTreeProps[p], oldTreeProps[p])) {
        hasPatch = true;
        setPropsPatches[p] = newTreeProps[p];
      }
    } else if (newTreeProps[p] !== oldTreeProps[p]) {
      hasPatch = true;
      setPropsPatches[p] = newTreeProps[p];
    }
  }
  // 检查新属性
  for (let p in newTree) {
    if (newTree.hasOwnProperty(p) && !oldTree.hasOwnProperty(p)) {
      hasPatch = true;
      setPropsPatches[p] = newTreeProps[p];
    }
  }
  if (!hasPatch) {
    return null;
  }
  return {
    set: setPropsPatches,
    remove: removePropsPatches
  };
}

function diffChildren (pChildNodes, nChildNodes, index, patches, currentPatches) {
  const diffs = listDiff(pChildNodes, nChildNodes, index, patches);
  const reorderChildNodes = diffs.rList;

  if (diffs.moves.length) { // 需要 reorder
    // reorder 的操作在父节点执行，所以应该加到父节点的 patch
    const reorderPatch = { type: PATCH.REORDER, moves: diffs.moves };
    currentPatches.push(reorderPatch);
  }
  
  // 除了重排的 patch 还有各个子节点自身的 patch
  let leftNode = null;
  let currentNodeIndex = index;
  for (let i = 0; i < pChildNodes.length; ++i) {
    currentNodeIndex = (leftNode && leftNode.count)
      ? currentNodeIndex + leftNode.count + 1
      : currentNodeIndex + 1
    diffWalk(pChildNodes[i], reorderChildNodes[i], currentNodeIndex, patches);
    leftNode = pChildNodes[i];
  }
}
