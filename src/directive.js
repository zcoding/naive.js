import { removeNode, addClass } from './dom';

export function handleDirective (directive, value, element, context) {
  switch (directive) {
    case 'show':
      element.style.display = value ? '' : 'none';
      break;
    case 'class':
      for (let c in value) {
        if (value[c]) {
          addClass(element, c);
        } else {
          removeClass(element, c);
        }
      }
      break;
    default:
      break;
  }
}
