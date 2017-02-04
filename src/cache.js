/**
 * 双向链表实现的使用 LRU 算法的缓存
 * 缓存最近最常用的项目，当缓存满时丢弃最近最少用的项目
 *
 * @param {Number} 缓存最大限制
 * @constructor
 */

export default function Cache (limit) {
  this.size = 0; // 缓存大小
  this.limit = limit; // 缓存大小最大限制
  this.head = this.tail = undefined; // 头尾指针
  this._keymap = Object.create(null); // 缓存映射表
}

var p = Cache.prototype;

/**
 * 将 <key> <value> 键值对存储到缓存映射表
 * 如果缓存满了，删除一个节点让出空间给新的缓存，并返回被删的节点
 * 否则返回 undefined
 *
 * @param {String} 键
 * @param {*} 值
 * @return {Entry|undefined}
 */

p.put = function (key, value) {
  var removed;

  var entry = this.get(key, true); // 先查看是否已经有缓存，如果有，只需要更新它的 value 就可以了
  if (!entry) {
    if (this.size === this.limit) { // 缓存满了
      removed = this.shift();
    }
    entry = {
      key: key
    };
    this._keymap[key] = entry;
    if (this.tail) {
      this.tail.newer = entry;
      entry.older = this.tail;
    } else {
      this.head = entry;
    }
    this.tail = entry; // 将这个项目作为最新的插入缓存
    this.size++;
  }
  entry.value = value;

  return removed;
}

/**
 * 从缓存中清除最近最少使用（放得最久的）项目
 * 返回被清除的项目，如果缓存为空就返回 undefined
 */

p.shift = function () {
  var entry = this.head;
  if (entry) {
    this.head = this.head.newer; // 头部的是最旧的，所以要从头部开始清除
    this.head.older = undefined;
    entry.newer = entry.older = undefined;
    this._keymap[entry.key] = undefined;
    this.size--;
  }
  return entry;
}

/**
 * 获取并且注册最近使用的 <key>
 * 返回 <key> 对应的值
 * 如果缓存中找不到这个 <key> 就返回 undefined
 *
 * @param {String} 键
 * @param {Boolean} 是否返回整个 entry ，如果为 false 则只返回 value
 * @return {Entry|*} 返回 Entry 或者它的值，或者 undefined
 */

p.get = function (key, returnEntry) {
  var entry = this._keymap[key];
  if (entry === undefined) return; // 缓存不存在，直接返回 undefined
  if (entry === this.tail) { // 缓存是最新的，直接返回这个缓存项（或者它的值）
    return returnEntry
      ? entry
      : entry.value;
  }
  // HEAD--------------TAIL
  //   <.older   .newer>
  //  <--- add direction --
  //   A  B  C  <D>  E
  if (entry.newer) { // 如果缓存不是最新的
    if (entry === this.head) { // 如果缓存是最旧的
      this.head = entry.newer; // 将比它新的作为最旧的
    }
    entry.newer.older = entry.older; // C <-- E. 将它的后一个作为前一个的最旧
  }
  if (entry.older) { // 如果有比它更旧的
    entry.older.newer = entry.newer; // C. --> E 将它的前一个作为后一个的最新
  }
  entry.newer = undefined; // D --x // 它本身没有更新的
  entry.older = this.tail; // D. --> E
  if (this.tail) {
    this.tail.newer = entry; // E. <-- D
  }
  this.tail = entry; // 将自己作为最新的
  return returnEntry
    ? entry
    : entry.value;
}
