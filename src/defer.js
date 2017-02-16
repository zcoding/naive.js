// 异步执行
// 如果 Promise 可用，就用 Promise，否则用 setTimeout
let resolved = typeof Promise!=='undefined' && Promise.resolve();
export const defer = resolved ? (f => { resolved.then(f); }) : setTimeout;

function nextTick () {}
