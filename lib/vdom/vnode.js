import { createElement, setAttr, appendChild } from '../dom'
import VText from './vtext'
import { isVNode, isVText, isVComponent } from './utils'
import { isArray, isFunction, warn, toArray } from '../utils'
import { handleDirective, bindDirective } from '../directive'
import { attachEvent } from '../event'
import { NaiveException } from '../exception'
import { getObjectFromPath } from '../parser'
import h from './h'

export default function VNode (tagName, props, children, key) {
  this.tagName = tagName
  this.props = props || {}
  this.key = key ? String(key) : undefined // key 用来标识节点，方便 diff
  let childNodes = []
  children = children || []
  for (let i = 0; i < children.length; ++i) {
    const child = children[i]
    if (isArray(child)) {
      childNodes = childNodes.concat(h.call(this, child))
    } else {
      if (child !== false) {
        childNodes.push(h.call(this, child))
      }
    }
  }
  this.children = childNodes
  let count = this.children.length
  for (let i = 0; i < this.children.length; ++i) {
    count += this.children[i].count || 0
  }
  this.count = count // 记录子节点数，在 patch 的时候找到节点位置
}

// 检查是否指令属性
function checkAttrDirective (attr) {
  return /^@|n-|:/.test(attr)
}

// add event listener
function isEventDirective (attr) {
  return /^@/.test(attr);
}

// 事件指令的值可能是表达式
function matchExpression (exp) {
  return exp.match(/(.*)\((.*)\)/);
}

// [重要] 解析事件绑定的方法
function parseArgumentList (exp) {
  let i = 0;
  let needSeparate = false;
  let inSingle = false;
  let single = [];
  let inDouble = false;
  let double = [];
  let inWord = false;
  let word = [];
  let args = [];
  while (i < exp.length) {
    const t = exp[i];
    if (t === '\'') {
      if (inSingle) {
        args.push({
          type: 'string',
          value: single.join('')
        });
        single.splice(0);
        inSingle = false;
        needSeparate = true;
      } else if (inDouble) {
        double.push(t);
      } else if (inWord) {
        throw new NaiveException('参数错误');
      } else if (needSeparate) {
        throw new NaiveException('参数错误');
      } else {
        inSingle = true;
      }
    } else if (t === '"') {
      if (inDouble) {
        args.push({
          type: 'string',
          value: double.join('')
        });
        double.splice(0);
        inDouble = false;
        needSeparate = true;
      } else if (inSingle) {
        double.push(t);
      } else if (inWord) {
        throw new NaiveException('参数错误');
      } else if (needSeparate) {
        throw new NaiveException('参数错误');
      } else {
        inDouble = true;
      }
    } else if (t === ',') {
      if (inSingle) {
        single.push(t);
      } else if (inDouble) {
        double.push(t);
      } else if (inWord) {
        args.push({
          type: 'exp',
          value: word.join('')
        });
        word.splice(0);
        inWord = false;
        needSeparate = false;
      } else if (!needSeparate) {
        throw new NaiveException('参数错误');
      } else {
        needSeparate = false;
      }
    } else if (t === ' ') {
      if (inSingle) {
        single.push(t);
      } else if (inDouble) {
        double.push(t);
      } else if (inWord) {
        throw new NaiveException('参数错误');
      }
    } else {
      if (inSingle) {
        single.push(t);
      } else if (inDouble) {
        double.push(t);
      } else if (inWord) {
        word.push(t);
      } else {
        if (needSeparate) {
          throw new NaiveException('参数错误');
        } else {
          word.push(t);
          inWord = true;
        }
      }
    }
    ++i;
  }
  if (inSingle || inDouble) {
    throw new NaiveException('参数错误');
  } else if (inWord) {
    args.push({
      type: 'exp',
      value: word.join('')
    });
  }
  return args;
}

function parseExpression (exp, data) {
  if (/^[+-]?\d+\.?\d*?$/.test(exp)) {
    return Number(exp);
  } else {
    return getObjectFromPath(data, exp);
  }
}

VNode.prototype.render = function renderVNodeToElement(context) {
  const element = createElement(this.tagName)
  const props = this.props
  const nodeContext = this
  for (let p in props) {
    if (props.hasOwnProperty(p)) {
      if (/^n-/.test(p)) {
        bindDirective(p.slice(2), props[p], element, context)
        handleDirective(p.slice(2), props[p], element, context)
      } else if (/^:/.test(p)) {
        handleDirective(p.slice(1), props[p], element, context)
      } else if (/^@/.test(p)) {
        const eventName = p.slice(1)
        const handler = props[p]
        attachEvent(element, eventName, handler)
      } else {
        setAttr(element, p, props[p])
      }
    }
  }
  for (let i = 0; i < this.children.length; ++i) {
    const child = this.children[i]
    const _isVComponent = isVComponent(child)
    if (_isVComponent) {
      // 如果是组件，先 update props
      child.$update()
    }
    appendChild(child.render(context), element)
    if (_isVComponent) {
      child._callHooks('mounted')
    }
  }
  return element
}
