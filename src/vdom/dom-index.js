// 映射 dom 树与 virtual-dom 树，找到对应索引的 dom 节点并保存索引映射
export function domIndex (domTree, vdomTree, indices) {
  if (indices.length === 0) {
    return {};
  } else {
    const mapping = {};
    recurse(domTree, vdomTree, indices, mapping, 0);
    return mapping;
  }
}

function recurse (rootNode, vdomTree, indices, mapping, rootIndex) {
  if (rootNode) {
    if (indexInRange(indices, rootIndex, rootIndex)) {
      mapping[rootIndex] = rootNode;
    }
    if (vdomTree.children) { // 只有 VNode 要查找 VText/VComponent 不需要
      let currentIndex = rootIndex;
      const childNodes = rootNode.childNodes;
      for (let i = 0; i < vdomTree.children.length; ++i) {
        const vChild = vdomTree.children[i] || {};
        currentIndex += 1;
        const nextIndex = currentIndex + (vChild.count || 0);
        if (indexInRange(indices, currentIndex, nextIndex)) {
          recurse(childNodes[i], vChild, indices, mapping, currentIndex);
        }
        currentIndex = nextIndex;
      }
    }
  }
}

// 查找 indices 数组（已排序），判断是否存在 [min, max] 区间内的元素
function indexInRange (indices, min, max) {
  if (indices.length === 0 || min > max) {
    return false;
  }
  let result = false;
  let head = 0, tail = indices.length - 1;
  let current, currentIndex;
  while (head <= tail) {
    currentIndex = ((head + tail) / 2) >> 0; // 移位操作为了快速向下取整
    current = indices[currentIndex];
    if (head === tail) {
      result = current >= min && current <= max;
      break;
    } else if (current < min) {
      head = currentIndex + 1;
    } else if (current > max) {
      tail = currentIndex - 1;
    } else { // min <= current <= max
      result = true;
      break;
    }
  }
  return result;
}
