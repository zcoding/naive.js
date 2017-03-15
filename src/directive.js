import { setAttr, removeAttr, removeClass } from './dom';
import { isArray } from './utils';
import klass from './directives/class';
import show from './directives/show';
import style from './directives/style';
import model from './directives/model';
import { attachEvent } from './event';
import { getObjectFromPath, setObjectFromPath } from './parser';

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
      if (element.type === 'radio') {
        attachEvent(element, 'change', function handleChange(event) {
          const selectValue = event.currentTarget.value;
          const currentState = context.state;
          setObjectFromPath(currentState, value, selectValue);
          context.setState(currentState);
        });
      } else if (element.type === 'checkbox') {
        attachEvent(element, 'change', function handleChange() {
          const selectValue = event.currentTarget.value;
          const currentState = context.state;
          const preValue = getObjectFromPath(currentState, value);
          if (event.currentTarget.checked) {
            if (preValue.indexOf(selectValue) === -1) {
              preValue.push(selectValue);
            }
          } else {
            let i = 0;
            while(i < preValue.length) {
              if (preValue[i] === selectValue) {
                preValue.splice(i, 1);
                break;
              }
              ++i;
            }
          }
          context.setState(currentState);
        });
      } else {
        attachEvent(element, 'input', function handleInput () {
          // 通过 path 设置 state
          const currentState = context.state;
          setObjectFromPath(currentState, value, element.value);
          context.setState(currentState);
        });
      }
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
