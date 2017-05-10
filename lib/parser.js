import Cache from './cache'
import { isUndefined } from './utils'

const pathCache = new Cache(1000)

const TrimRE = /^\s+|\s$/g
const WordsRE = /([a-zA-Z$][\w.$]*)/g

// 一个别名对应一个作用域
function parseExpressionFor(exp, scope) {
  var vars = exp.split(/\s+in\s+/)
  var alias = vars[0], expression = vars[1]
  return {
    alias: alias,
    raw: expression,
    scope: expression,
    expression: parseExpressionGetter(expression, scope)
  }
}

export function splitPath(expression) {
  expression = expression.replace(/^\s+|\s$/g, '') // trim
  var wordsRE = /([a-zA-Z$][\w.$]*)/g
  return expression.match(wordsRE) || []
}

const saveRE = /[\{,]\s*[\w\$_]+\s*:|('(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*")/g
const restoreRE = /"(\d+)"/g
const wsRE = /\s/g
const newlineRE = /\n/g
const identRE = /[^\w$\.](?:[A-Za-z_$][\w$]*)/g

var saved = []

function save (str, isString) {
  var i = saved.length
  saved[i] = isString
    ? str.replace(newlineRE, '\\n')
    : str
  return '"' + i + '"'
}

function rewrite (raw, scope) {
  var c = raw.charAt(0)
  var path = raw.slice(1)
  path = path.indexOf('"') > -1
    ? path.replace(restoreRE, restore)
    : path
  var scopeVarKey = ''
  for (let i = scope.length - 1; i >= 0; --i) { // 从后往前
    var _scope = scope[i]
    var namePaths = parsePath(path)
    if (namePaths.length > 0 && namePaths[0] === _scope.alias) { // 匹配到别名，说明在当前作用域
      namePaths = namePaths.slice(1)
      scopeVarKey = _scope.scope + '[' + _scope.$index + ']' + (namePaths.length > 0 ? '.' + namePaths.join('.') : '')
      break
    }
  }
  var body = 'vm.get("' + (scopeVarKey ? scopeVarKey : path) + '")'
  return c + body
}

function restore (str, i) {
  return saved[i]
}

/**
 * 解析一个表达式
 * @param {String} expression 表达式字符串
 * @param {String} scope 作用域限制
 * @return {Function} 一个函数，用来返回表达式的值
 */
export function parseExpressionGetter(expression, scope) {
  saved.length = 0
  var parsed = expression
    .replace(saveRE, save)
    .replace(wsRE, '')
  parsed = (' ' + parsed)
    .replace(identRE, function(raw) {
      return rewrite(raw, scope)
    })
    .replace(restoreRE, restore)
  return makeGetterFunction(parsed)
}

function makeGetterFunction(body) {
  return new Function('vm', 'return ' + body + ';');
}

/**
 * parseExpression 解析表达式
 * 对于 `b-for` 指令，需要特殊处理，其它指令只要返回表达式执行函数即可
 *
 * @param {String} name 指令名称
 * @param {String} expression 表达式字符串
 * @param {String} 作用域限制
 * @return {{raw:String, expression:Function}}
 */
export function parseExpression(name, expression, scope) {
  if (name === 'b-for') {
    return parseExpressionFor(expression, scope)
  }
  if (name === 'b-on') {
    return {
      raw: expression,
      expression: expression
    }
  }
  return {
    raw: expression,
    expression: parseExpressionGetter(expression, scope)
  }
}

/**
 * parsePath 解析取值路径，返回真正的值，如果找不到，返回 undefined
 *
 * @param {Object} data
 * @param {String} path
 * @return {*} value
 * @throw {Error} 不合法的路径
 *
 * @example
 * parsePath('a.b.c') === ['a', 'b', 'c']
 */
export function parsePath(path) {
  var hit = pathCache.get(path)
  if (hit) {
    return hit
  }
  // data.a.b.c 👍
  // data.a["b"].c 👍
  // data["a"]["b"]["c"] 👍
  // data.a["b.c"] 👍
  // data["a.b.c"] 👍
  // data.a[b] 👎
  // data.a[b.c] 👎
  var parts = path.split(/\[|\]/g), i = 0
  var props = []
  while (i < parts.length) {
    var match1 = /^(\.)?[^\'\"\.\s]+(\.[^\'\"\.\s]+)*$/.test(parts[i])
    var match2 = /(^\s*\'.+\'\s*$)|(^\s*\".+\"\s*$)|(^\s*$)/.test(parts[i])
    if (!(match1 || match2)) {
      throw new Error("不合法的路径: " + path)
    }
    if (match1) {
      var _props = parts[i].split('.'), j = 0
      while(j < _props.length) {
        if (_props[j] === '') {
          if (i !== 0) {
            j++
            continue
          } else {
            throw new Error("不合法的路径: " + path)
          }
        } else {
          props.push(_props[j])
        }
        j++
      }
    } else { // match2
      if (!/^\s*$/.test(parts[i])) {
        var _prop = parts[i].replace(/^\s*[\"\']|[\'\"]\s*$/g, '')
        props.push(_prop)
      }
    }
    i++
  }
  pathCache.put(path, props)
  return props
}

export function getObjectFromPath(data, path) {
  var props = parsePath(path)
  var result = props.length > 0 ? data : void 0
  for (let i = 0; i < props.length; ++i) {
    result = result[props[i]]
    if (!result) {
      break
    }
  }
  return result
}

export function setObjectFromPath(data, path, value) {
  var props = parsePath(path)
  var current = data, parent = data
  for (var i = 0; i < props.length - 1; ++i) {
    parent = current
    current = current[props[i]]
    if (isUndefined(current)) {
      current = {}
      parent[props[i]] = current
    }
  }
  if (i >= 0) {
    if (typeof current === 'object') {
     current[props[i]] = value
    } else {
      current = {}
      current[props[i]] = value
      parent[props[i-1]] = current
    }
  }
}
