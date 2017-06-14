import { isUndefined, toArray, isString, makeMap } from './utils'

const isSVG = makeMap('svg,animate,circle,clippath,cursor,defs,desc,ellipse,filter,font-face,foreignObject,g,glyph,image,line,marker,mask,missing-glyph,path,pattern,polygon,polyline,rect,switch,symbol,text,textpath,tspan,use,view', true)

export function getElement(selector) {
  if (isString(selector)) {
    if (selector[0] === '#') {
      return document.getElementById(selector.slice(1))
    } else {
      return query(selector)
    }
  } else {
    return selector
  }
}

export function createElement(nodeName) {
  const node = isSVG(nodeName) ? document.createElementNS('http://www.w3.org/2000/svg', nodeName) : document.createElement(nodeName)
  node.normalizedNodeName = nodeName
  return node
}

export function createTextNode (text) {
  return document.createTextNode(text)
}

export function createDocumentFragment () {
  return document.createDocumentFragment()
}

export function query(selector, context) {
  context = context || document
  return context.querySelector(selector)
}

/**
 * 检查一个元素是否在 document 内
 */
export function inDoc(node) {
  const doc = node.ownerDocument.documentElement
  return doc === node || node && node.nodeType === 1 && doc.contains(node)
}

export function removeNode(node) {
  const parentNode = node ? node.parentNode : null
  if (parentNode) {
    parentNode.removeChild(node)
  }
}

export function before(newNode, node) {
  node.parentNode.insertBefore(newNode, node)
}

export function replaceNode(newNode, node) {
  node.parentNode.replaceChild(newNode, node)
}

export function after(el, target) {
  if (target.nextSibling) {
    before(el, target.nextSibling)
  } else {
    target.parentNode.appendChild(el)
  }
}

export function appendChild (el, target) {
  target.appendChild(el)
}

export function setAttr (node, attr, value) {
  node.setAttribute(attr, value)
}

export function hasAttr(node, name) {
  return node.hasAttribute(name)
}

export function removeAttr(node, name) {
  node.removeAttribute(name)
}

const supportClassList = !isUndefined(document.createElement('div').classList)

let getClasses = supportClassList ?
  function(element) {
    return toArray(element.classList)
  }
  :
  function(element) {
    return element.className.split(/\s+/).filter(s => s)
  }

export let hasClass = supportClassList ?
  function(element, classes) {
    classes = classes.split(/\s+/).filter(s => s)
    var contains = true
    for (let i = 0; i < classes.length; ++i) {
      if (!element.classList.contains(classes[i])) {
        contains = false
        break
      }
    }
    return contains
  }
  :
  function(element, classes) {
    classes = classes.split(/\s+/).filter(s => s)
    var contains = true, tmp = element.className
    for (let i = 0; i < classes.length; ++i) {
      if (tmp.indexOf(classes[i]) === -1) {
        contains = false
        break
      }
    }
    return contains
  }

export let addClass = supportClassList ?
  function(element, classes) {
    classes = classes.split(/\s+/).filter(s => s)
    element.classList.add.apply(element.classList, classes)
    return element
  }
  :
  function(element, classes) {
    var tmp = element.className
    classes = classes.split(/\s+/).filter(s => s)
    classes.forEach(c => {
      if (!hasClass(element, c)) {
        tmp = tmp.replace(/\s+|$/, ' ' + classes)
      }
    })
    element.className = tmp
    return element
  }

export let removeClass = supportClassList ?
  function(element, classes) {
    classes = classes.split(/\s+/).filter(s => s)
    element.classList.remove.apply(element.classList, classes)
    return element
  }
  :
  function(element, classes) {
    var tmp = element.className
    classes = classes.split(/\s+/).filter(s => s)
    classes.forEach(c => {
      if (hasClass(element, c)) {
        tmp = tmp.replace(new RegExp(c, 'g'), '')
      }
    })
    element.className = tmp
    return element
  }

export let toggleClass = supportClassList ?
  function(element, classes, force) {
    classes = classes.split(/\s+/).filter(s => s)
    classes.forEach(c => {
      element.classList.toggle(c, force)
    })
    return element
  }
  :
  function(element, classes, force) {
    classes = classes.split(/\s+/).filter(s => s)
    var useForce = force !== undefined
    classes.forEach(c => {
      if (hasClass(element, c) && (useForce && !force || !useForce)) {
        removeClass(element, c)
      } else if (!hasClass(element, c) && (useForce && force || !useForce)) {
        addClass(element, c)
      }
    })
    return element
  }
