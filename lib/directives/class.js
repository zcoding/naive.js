import { isArray } from '../utils'
import { addClass, removeClass, setAttr } from '../dom'

export default function staticClass (setValue, element, context) {
  if (typeof setValue === 'string') {
    setAttr(element, 'class', setValue)
  } else if (isArray(setValue)) {
    setAttr(element, 'class', setValue.join(' '))
  } else {
    for (let c in setValue) {
      if (setValue.hasOwnProperty(c)) {
        if (setValue[c]) {
          addClass(element, c)
        } else {
          removeClass(element, c)
        }
      }
    }
  }
}
