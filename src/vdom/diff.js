import { isVNode, isVText } from './utils';
import listDiff from './list-diff';
import { PATCH } from './patch';
import { isArray } from '../utils';

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
        currentPatches.push({type: PATCH.PROPS, props: propsPatches});
      }
      // 继续 diff 子节点
      diffChildren(pNode.children, nNode.children, index, patches, currentPatches);
    }
  } else if (isVText(pNode) && isVText(nNode)) { // 都是 VText
    if (pNode.data !== nNode.data) { // 内容不一样的时候才替换（只替换内容即可）
      currentPatches.push({type: PATCH.TEXT, data: nNode.data});
    }
  } else { // 类型不一样，绝对要替换
    currentPatches.push({type: PATCH.REPLACE, node: nNode});
  }
  if (currentPatches.length) {
    patches[index] = currentPatches;
  }
}

function diffProps (oldTree, newTree) {
  let oldTreeProps = oldTree.props;
  let newTreeProps = newTree.props;
  let propsPatches = {}, count = 0;
  for (let p in oldTreeProps) {
    if (!newTreeProps.hasOwnProperty(p) || newTreeProps[p] !== oldTreeProps[p]) {
      propsPatches[p] = newTreeProps[p];
      count += 1;
    }
  }
  if (count <= 0) {
    return null;
  }
  return propsPatches;
}

function diffChildren (pChildNodes, nChildNodes, index, patches, currentPatches) {
  const diffs = listDiff(pChildNodes, nChildNodes, index, patches);
  const newChildren = diffs.children;

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
    diffWalk(pChildNodes[i], newChildren[i], currentNodeIndex, patches);
    leftNode = pChildNodes[i];
  }
}
