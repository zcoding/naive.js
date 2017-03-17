// 异步执行
// 如果 Promise 可用，就用 Promise，否则用 setTimeout
let resolved = typeof Promise!=='undefined' && Promise.resolve();
export const defer = resolved ? (f => { resolved.then(f); }) : setTimeout;

let items = [];

export function enqueueRender(component) {
  if (!component._dirty && (component._dirty = true) && items.push(component)==1) {
    defer(rerender);
  }
}

function rerender() {
  let p, list = items;
  items = [];
  while ( (p = list.pop()) ) {
    if (p._dirty) {
      p.update();
    }
  }
}
