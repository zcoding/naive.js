import { setAttr, removeAttr, removeClass } from './dom';
import { isArray } from './utils';
import klass from './directives/class';
import show from './directives/show';
import style from './directives/style';
import model from './directives/model';
import { attachEvent } from './event';

export function handleDirective (directive, value, element, context) {
  switch (directive) {
    case 'show':
      show(value, element, context);
      break;
    case 'class':
      klass(value, element, context);
      break;
    case 'style':
      style(value, element, context);
      break;
    case 'model':
      model(value, element, context);
      break;
    default:
      if (directive === 'disabled' || directive === 'checked') {
        if (value) {
          setAttr(element, directive, directive);
        } else {
          removeAttr(element, directive);
        }
      } else {
        setAttr(element, directive, value);
      }
      break;
  }
}

export function bindDirective (directive, value, element, context) {
  switch (directive) {
    case 'model':
      attachEvent(element, 'input', function handleInput () {
        const setter = {};
        setter[value] = element.value;
        context.setState(setter);
      });
      break;
    default:
  }
}

function removeClassAttr (removeValue, element, context) {
  if (typeof removeValue === 'string') {
    removeClass(element, removeValue);
  } else if (isArray(removeValue)) {
    removeClass(element, removeValue.join(' '));
  } else {
    for (let c in removeValue) {
      if (removeValue.hasOwnProperty(c)) {
        removeClass(element, c);
      }
    }
  }
}

export function handleDirectiveRemove (directive, value, element, context) {
  switch (directive) {
    case 'class':
      removeClassAttr(value, element, context);
      break;
  }
}
