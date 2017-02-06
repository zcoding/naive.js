import { PATCH } from './patch'; //REORDER_INSERT

// 分别找到有 key 的元素位置和没有 key 的元素的位置
function makeKeyIndexAndFree (list) {
  const keyIndex = {}; // 有 key 的节点位置
  const free = []; // 可替换的位置（没有 key 的节点都被标识为可替换的节点）
  for (let i = 0, len = list.length; i < len; i++) {
    const item = list[i]
    const itemKey = item.key;
    if (itemKey) {
      keyIndex[itemKey] = i;
    } else {
      free.push(item);
    }
  }
  return {
    keyIndex: keyIndex,
    free: free
  };
}

export default function listDiff (pList, nList) {
  const nMap = makeKeyIndexAndFree(nList);
  const nKeys = nMap.keyIndex, nFree = nMap.free;
  const pMap = makeKeyIndexAndFree(pList);
  const pKeys = pMap.keyIndex, pFree = pMap.free;
  // 先处理有 key 的元素，看其在 nList 还是否存在，如果不存在说明被移除
  const children = [];
  for (let i = 0, freeIndex = 0; i < pList.length; ++i) {
    const item = pList[i];
    const itemKey = item.key;
    if (itemKey) {
      if (!nKeys.hasOwnProperty(itemKey)) {
        children.push(null);
      } else {
        const itemKeyIndex = nKeys[itemKey];
        children.push(nList[itemKeyIndex]);
      }
    } else {
      children.push(nFree[freeIndex++] || null);
    }
  }
  const moves = [];
  function remove (index) {
    moves.push({
      type: PATCH.REMOVE,
      index: index
    });
  }
  function insert (index, item) {
    moves.push({
      type: PATCH.INSERT,
      index: index,
      item: item
    });
  }
  const simulateList = children.slice(0);
  // 找出被移除的节点
  let i = 0;
  while (i < simulateList.length) {
    if (simulateList[i] === null) {
      remove(i);
      simulateList.splice(i, 1);
    } else {
      ++i;
    }
  }
  // 遍历 nList
  for (let s = 0, n = 0; n < nList.length; ++n) {
    const nItem = nList[n];
    const nItemKey = nItem.key;
    const sItem = simulateList[s];
    if (sItem) {
      const sItemKey = sItem.key;
      if (sItemKey === nItemKey) { // 相同元素相同位置
        s++;
      } else {
        if (!pKeys.hasOwnProperty(nItemKey)) { // 旧列表中不存在，新节点
          insert(n, nItem); // 在位置 n 插入新节点 nItem
        } else { // 旧列表中存在，需要移位（移位操作包括删除和插入两者中的一个或两个）
          const nsItemKey = simulateList[s + 1].key;
          if (nsItemKey === nItemKey) {
            remove(n);
            simulateList.splice(s, 1);
            s++;
          } else {
            insert(n, nItem);
          }
        }
      }
    } else { // 旧列表该位置为空，直接插入
      insert(n, nItem);
    }
  }
  return {
    moves: moves,
    children: children
  };
}
