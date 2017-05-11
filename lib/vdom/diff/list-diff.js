import { isVComponent } from '../node-types'

// 分别找到有 key 的元素位置和没有 key 的元素的位置
function keyIndex (list) {
  const keys = {} // 有 key 的节点位置
  const free = [] // 可替换的位置（没有 key 的节点都被标识为可替换的节点）
  for (let i = 0; i < list.length; i++) {
    const item = list[i]
    const itemKey = item.key
    if (typeof itemKey !== 'undefined') {
      keys[itemKey] = i
    } else {
      free.push(i)
    }
  }
  return {
    keys: keys,
    free: free
  }
}

// 模拟删除
function remove(arr, index, key) {
  arr.splice(index, 1)
  return {
    from: index,
    key: key
  }
}

export default function reorder(pList, nList) {
  // N: pList.length
  // M: nList.length
  // O(M) time, O(M) memory
  const nListIndex = keyIndex(nList)
  const nKeys = nListIndex.keys
  const nFree = nListIndex.free

  if (nFree.length === nList.length) { // 如果 nList 全部节点都没有 key 就不需要 reorder 把 nList 直接作为 reorder 之后的列表返回
    return {
      list: nList,
      moves: null
    }
  }

  // O(N) time, O(N) memory
  const pListIndex = keyIndex(pList)
  const pKeys = pListIndex.keys
  const pFree = pListIndex.free

  if (pFree.length === pList.length) { // 如果 pList 全部节点都没有 key 就不需要 reorder 把 nList 直接作为 reorder 之后的列表返回
    return {
      list: nList,
      moves: null
    }
  }

  // O(MAX(N, M)) memory
  const rList = []

  let freeIndex = 0 // 表示没有 key 的节点已使用的个数
  let freeCount = nFree.length // 表示 nList 中没有 key 的节点的总个数
  let deletedItems = 0 // 被删除的节点的个数

  // O(N) time
  // 遍历 pList 将 pList 有 key 的节点映射到 nList 的节点，如果没有映射，就用 null 表示节点将被删除。pList 空闲节点用 nList 的空闲节点按顺序占位
  for (let i = 0; i < pList.length; i++) {
    const pItem = pList[i]

    if (typeof pItem.key !== 'undefined') { // key 节点
      if (nKeys.hasOwnProperty(pItem.key)) { // 有映射
        const itemIndex = nKeys[pItem.key]
        rList.push(nList[itemIndex])
      } else { // 没有映射
        deletedItems++
        rList.push(null)
      }
    } else { // 空闲节点
      if (freeIndex < freeCount) { // nList 的空闲节点还没用完，继续用
        const itemIndex = nFree[freeIndex++]
        rList.push(nList[itemIndex])
      } else { // nList 的空闲节点用完了，这个 pList 的空闲节点没有节点与其对应，应该被删除
        deletedItems++
        rList.push(null)
      }
    }
  }

  const lastFreeIndex = freeIndex >= nFree.length ? // nList 中下一个空闲节点的位置
      nList.length : // nList 中空闲节点已经用完了
      nFree[freeIndex] // 未用完

  // O(M) time
  // 遍历 nList 将新增节点／剩余空闲节点追加到 rList 末尾
  for (let j = 0; j < nList.length; j++) {
    const nItem = nList[j]
    if (nItem.key) {
      if (!pKeys.hasOwnProperty(nItem.key)) {
        rList.push(nItem)
      }
    } else if (j >= lastFreeIndex) {
      rList.push(nItem)
    }
  }

  const simulateList = rList.slice(0) // 复制一份，模拟 rList -> nList 重排操作
  let simulateIndex = 0
  const removes = [] // 被移除的节点
  const inserts = [] // 被插入的节点
  let simulateItem

  for (let k = 0; k < nList.length;) {
    const wantedItem = nList[k] // 目标节点
    simulateItem = simulateList[simulateIndex] // 模拟节点

    // 先模拟删除
    while (simulateItem === null && simulateList.length) {
      removes.push(remove(simulateList, simulateIndex, null)) // 删除不需要记录 key 的节点
      simulateItem = simulateList[simulateIndex]
    }

    if (!simulateItem || simulateItem.key !== wantedItem.key) {
      // 如果当前位置有 key
      if (wantedItem.key) {
        // 如果当前节点的位置不对，要进行移动
        if (simulateItem && simulateItem.key) {
          if (nKeys[simulateItem.key] !== k + 1) {
            if (isVComponent(simulateItem)) {
              // debugger
            }
            removes.push(remove(simulateList, simulateIndex, simulateItem.key)) // 先移除当前位置的节点
            simulateItem = simulateList[simulateIndex] // 删除后，该位置对应的是下一个节点
            // 然后在当前位置插入目标节点
            if (!simulateItem || simulateItem.key !== wantedItem.key) { // 如果删除之后还不对应，就插入目标节点
              inserts.push({key: wantedItem.key, to: k})
            } else { // 删除后正好对应就不需要插入了
              simulateIndex++ // 检查下一个
            }
          }
          else { // nKeys[simulateItem.key] === k + 1 如果下一个目标节点和当前模拟节点对应
            inserts.push({key: wantedItem.key, to: k})
          }
        }
        else { // 位置不对，插入
          inserts.push({key: wantedItem.key, to: k})
        }
        k++
      }
      // 目标节点没有 key 但是 模拟节点有 key
      else if (simulateItem && simulateItem.key) {
        // 位置不对，删除
        removes.push(remove(simulateList, simulateIndex, simulateItem.key))
      }
    } else {
      simulateIndex++
      k++
    }
  }

  // 删除所有剩余节点
  while(simulateIndex < simulateList.length) {
    simulateItem = simulateList[simulateIndex]
    removes.push(remove(simulateList, simulateIndex, simulateItem && simulateItem.key))
  }

  // 这种情况不需要移位，只需要删除多余的节点：没有 key 对应的节点、多余的空闲节点
  if (removes.length === deletedItems && !inserts.length) {
    return {
      list: rList,
      moves: null
    }
  }

  return {
    list: rList,
    moves: {
      removes: removes,
      inserts: inserts
    }
  }
}

// reorder:
// [f1, A, B, C, D, f2] => [f3, C, B, A, f4, E, f5]
// rList: [f3, A, B, C, null, f4]
// rList: [f3, A, B, C, null, f4, E, f5]
// deletedItems: 1
// simulateList: [f3, A, B, C, null, f4, E, f5]
// nList:        [f3, C, B, A, f4,   E,  f5   ]
// si:0, k:0, nItem:f3, sItem:f3
// s1:1, k:1, nItem:C, sItem:A
// remove(1, A) => simulateList:[f3, B, C, null, f4, E, f5], sItem:B
// insert(1, C) k++
// si:1, k:2, nItem:B, sItem:B
// si:2, k:3, nItem:A, sItem:C
// remove(2, C) => simulateList:[f3, B, null, f4, E, f5], sItem:null
// insert(3, A) k++
// si:2, k:4, nItem:f4, sItem:null
// remove(2, null) => simulateList:[f3, B, f4, E, f5], sItem:f4
// si:2, k:4, nItem:f4, sItem:f4 => si++, k++
// si:3, k:5, nItem:E, sItem:E => si++, k++
// si:4, k:6, nItem:f5, sItem:f5 => si++, k++
// si:5, k:7
// moves:{removes: [(1, A), (2, C), (2, null)], inserts: [(1, C), (3, A)]}

// diffChildren:
// pList: [f1, A1, B1, C1, D,    f2       ]
// rList: [f3, A2, B2, C2, null, f4, E, f5]
// diff(f1, f3)
// diff(A1, A2)
// diff(B1, B2)
// diff(C1, C2)
// diff(D, null) => remove(D)
// diff(f2, f4)
// insert(null, E)
// insert(null, f5)
// {order: moves}

// patch:
// [f1, A1, B1, C1, D, f2]
// 目标: [f3, C2, B2, A2, f4, E, f5]
// insert(null, E) => [f1, A1, B1, C1, D, f2, E]
// insert(null, f5) => [f1, A1, B1, C1, D, f2, E, f5]
// patch order:
// remove(1, A) => [f1, B1, C1, D, f2, E, f5], map:{A: A1}
// remove(2, C) => [f1, B1, D, f2, E, f5], map:{A: A1, C: C1}
// remove(2, null) => [f1, B1, f2, E, f5]
// insert(1, C) => [f1, C1, B1, f2, E, f5]
// insert(3, A) => [f1, C1, B1, A1, f2, E, f5]
// patch 子节点
// patch(f1, f3)
// patch(A1, A2)
// patch(B1, B2)
// patch(C1, C2)
// remove D 已删除，不会重复删除
// patch(f2, f4)
