import { isVNode, isVText, isVComponent } from './utils';
import { isArray, isPlainObject } from '../utils';
import listDiff from './list-diff';
import { PATCH } from './patch';

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
    } else if (p === 'n-model') {
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

// 按照先删除后插入的顺序
function diffChildren (pChildren, nChildren, parentIndex, patches, parentPatches) {
  const diffs = listDiff(pChildren, nChildren);
  const orderedList = diffs.list;

  const pLen = pChildren.length;
  const oLen = orderedList.length;
  const len = pLen > oLen ? pLen : oLen; // const len = max(pLen, oLen);

  let currentIndex = parentIndex;
  for (let i = 0; i < len; ++i) {
    const pNode = pChildren[i];
    const nNode = orderedList[i];
    currentIndex = currentIndex + 1;
    if (!pNode) {
      if (nNode) { // 旧的没有新的有，插入（末尾）
        parentPatches.push({
          type: PATCH.INSERT,
          node: nNode
        });
      }
    } else {
      diffWalk(pNode, nNode, currentIndex, patches);
    }
    if (pNode && pNode.count) {
      currentIndex += pNode.count;
    }
  }
  if (diffs.moves) {
    parentPatches.push({
      type: PATCH.REORDER,
      moves: diffs.moves
    });
  }
}

function diffWalk (pVdom, nVdom, currentIndex, patches) {
  let currentPatches = []; // 当前层级的 patch
  if (nVdom === null) { // * VS null
    currentPatches.push({
      type: PATCH.REMOVE,
      from: currentIndex,
      key: null
    });
  } else if (isVNode(pVdom) && isVNode(nVdom)) { // VNode VS VNode
    if (pVdom.tagName !== nVdom.tagName || pVdom.key !== nVdom.key) { // 不同 tagName/key 节点: 替换
      currentPatches.push({
        type: PATCH.REPLACE,
        node: nVdom
      });
    } else { // 同 key 同 tagName 节点: 比较属性和子节点
      const propsPatches = diffProps(pVdom, nVdom);
      if (propsPatches) {
        currentPatches.push({
          type: PATCH.PROPS,
          props: propsPatches
        });
      }
      // 继续 diff 子节点
      diffChildren(pVdom.children, nVdom.children, currentIndex, patches, currentPatches);
    }
  } else if (isVText(pVdom) && isVText(nVdom)) { // VText VS VText
    if (pVdom.data !== nVdom.data) { // 内容不一样的时候才替换（只替换内容即可）
      currentPatches.push({type: PATCH.TEXT, data: nVdom.data});
    }
  } else if (isVComponent(pVdom) || isVComponent(nVdom)) { // * VS Component | Component VS *
    // 忽略，不在这里处理
  } else { // 不同类型的节点
    currentPatches.push({
      type: PATCH.REPLACE,
      node: nVdom
    });
  }
  if (currentPatches.length > 0) {
    patches[currentIndex] = currentPatches;
  }
}

export function diff (pVdom, nVdom) {
  let patch = {};
  patch.pVdom = pVdom;
  const patches = {};
  if (isArray(pVdom)) {
    const currentPatches = [];
    diffChildren(pVdom, nVdom, 0, patches, currentPatches);
    if (currentPatches.length > 0) {
      patches[0] = currentPatches;
    }
  } else {
    diffWalk(pVdom, nVdom, 0, patches);
  }
  patch.patches = patches;
  return patch;
}
