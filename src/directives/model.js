import { getObjectFromPath } from '../parser';
import { isArray } from '../utils';

export default function model(value, element, context) {
  const currentValue = getObjectFromPath(context.state, value);
  if (element.type === 'radio') {
    element.checked = currentValue === element.value;
  } else if (element.type === 'checkbox') {
    if (isArray(currentValue)) {
      element.checked = currentValue.indexOf(element.value) !== -1;
    } else {
      element.checked = currentValue === element.value;
    }
  } else {
    if (element.value !== currentValue) {
      element.value = currentValue;
    }
  }
}
