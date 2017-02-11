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

  // rList 数组保存的是 nList 的节点，根据 key 找到 pList 中的对应节点并按照 pList 中节点的顺序排列，这样就可以在 diffChildren 的时候按顺序一一比较
  // 在“重排”的过程中，记录实现 nList 的节点顺序的重排操作，保存在 moves 中，这样在 patch 的时候就可以找到对应的 dom
  const rList = [];

  // 找 pList 中有 key 的节点的对应节点
  for (let i = 0, freeIndex = 0; i < pList.length; ++i) {
    const item = pList[i];
    const itemKey = item.key;
    if (itemKey) {
      if (!nKeys.hasOwnProperty(itemKey)) { // 如果 pList 有但 nList 没有，说明该节点一定会被删掉
        rList.push(null);
      } else { // 有对应节点
        const itemKeyIndex = nKeys[itemKey];
        rList.push(nList[itemKeyIndex]);
      }
    } else { // 如果该节点没有 key 就在 nList 中也找一个没有 key 的节点（空闲节点）来填这个位置（按照顺序取），如果 nList 已经没有“空闲节点”，那么这个节点一定会被删掉
      rList.push(nFree[freeIndex++] || null);
    }
  }
  const moves = [];
  function remove (index, key) {
    moves.push({
      type: PATCH.REMOVE,
      index: index,
      key: key
    });
  }
  function insert (index, item) {
    moves.push({
      type: PATCH.INSERT,
      index: index,
      item: item
    });
  }
  // rList 已经处理完，开始模拟 reorder 操作，找出实际 reorder 的操作步骤
  // simulateList 用来模拟 reorder 过程中的 pList
  const simulateList = rList.slice(0);
  // 找出 pList 中被移除的节点（前面已经标识为 null 的节点）
  for (let i = 0; i < simulateList.length;) {
    if (simulateList[i] === null) {
      remove(i);
      simulateList.splice(i, 1);
    } else {
      ++i;
    }
  }
  // 遍历 nList 安排其他节点，包括没有被删的节点（有 key 对应的节点）、nList 中有 pList 中没有的节点
  for (let s = 0, n = 0; n < nList.length; ++n) {
    const nItem = nList[n];
    const nItemKey = nItem.key;
    const sItem = simulateList[s];
    if (sItem) { // 已经超出 simulateList 范围，剩余的节点都插入
      const sItemKey = sItem.key;
      if (sItemKey === nItemKey) { // 位置相同，不需要 reorder 包括没有 key 的也不需要 reorder
        ++s;
      } else {
        if (typeof nItemKey !== 'undefined' && !pKeys.hasOwnProperty(nItemKey)) { // 旧列表中不存在，新节点直接插入
          insert(n, nItem);
        } else { // 旧列表中存在，需要对 sItem 和 nItem 进行对调
          const nextSItem = simulateList[s + 1];
          if (nextSItem && (nextSItem.key === nItemKey)) {
            remove(n, sItemKey);
            simulateList.splice(s, 1);
            ++s;
          } else {
            insert(n, nItem);
            if (n === nList.length-1) {
              remove(n+1, sItemKey);
            }
          }
        }
      }
    } else { // 旧列表该位置为空，直接插入
      insert(n, nItem);
    }
  }
  // console.log(moves)
  return {
    moves: moves,
    rList: rList
  };
}
