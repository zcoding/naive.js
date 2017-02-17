import { createElement, setAttr, appendChild } from '../dom';
import VText from './vtext';
import { isVNode, isVText, isVComponent } from './utils';
import { isArray, isFunction, warn, toArray } from '../utils';
import { handleDirective, bindDirective } from '../directive';
import { attachEvent } from '../event';
import { NaiveException } from '../exception';
import { getObjectFromPath } from '../parser';

export default function VNode (tagName, props, children, key) {
  this.tagName = tagName;
  this.props = props || {};
  this.key = key ? String(key) : undefined; // key 用来标识节点，方便 diff
  let childNodes = [];
  children = children || [];
  for (let i = 0; i < children.length; ++i) {
    const child = children[i];
    if (isVNode(child) || isVText(child) || isVComponent(child)) {
      childNodes.push(child);
    } else if (typeof child === 'string' || typeof child === 'number') {
      childNodes.push(new VText(child));
    } else if (isArray(child)) {
      childNodes = childNodes.concat(child);
    } else {
      // warn('children 类型不支持');
    }
  }
  this.children = childNodes;
  let count = this.children.length;
  for (let i = 0; i < this.children.length; ++i) {
    count += this.children[i].count || 0;
  }
  this.count = count; // 记录子节点数，在 patch 的时候找到节点位置
}

// 检查是否指令属性
function checkAttrDirective (attr) {
  return /^@|n-|:/.test(attr);
}

// add event listener
function isEventDirective (attr) {
  return /^@/.test(attr);
}

// 事件指令的值可能是表达式
function matchExpression (exp) {
  return exp.match(/(.*)\((.*)\)/);
}

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

export function bindEvent (eventName, exp, element, context) {
  let handlerFunc;
  if (isFunction(exp)) {
    handlerFunc = exp;
  } else {
    const matches = matchExpression(exp);
    if (matches) {
      const methodName = matches[1];
      handlerFunc = function (evt) {
        const args = parseArgumentList(matches[2]);
        const _args = [];
        for (let i = 0; i < args.length; ++i) {
          if (args[i].type === 'string') {
            _args.push(args[i].value);
          } else if (args[i].value === '$event') {
            _args.push(evt);
          } else {
            _args.push(parseExpression(args[i].value, this.state));
          }
        }
        this[methodName].apply(this, _args);
      };
    } else {
      handlerFunc = context[exp];
    }
  }
  attachEvent(element, eventName, function handler(evt) {
    return handlerFunc.call(context, evt);
  });
}

VNode.prototype.render = function renderVNodeToElement(context) {
  const element = createElement(this.tagName);
  const props = this.props;
  const nodeContext = this;
  for (let p in props) {
    if (props.hasOwnProperty(p)) {
      if (/^n-/.test(p)) {
        bindDirective(p.slice(2), props[p], element, context);
        handleDirective(p.slice(2), props[p], element, context);
      } else if (/^:/.test(p)) {
        handleDirective(p.slice(1), props[p], element, context);
      } else if (/^@/.test(p)) {
        const eventName = p.slice(1);
        const exp = props[p];
        bindEvent(eventName, exp, element, context);
      } else {
        setAttr(element, p, props[p]);
      }
    }
  }
  for (let i = 0; i < this.children.length; ++i) {
    appendChild(this.children[i].render(context), element);
  }
  return element;
};
