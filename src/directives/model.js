import { getObjectFromPath } from '../parser';

export default function model(value, element, context) {
  const currentValue = getObjectFromPath(context.state, value);
  if (element.tagName === 'INPUT') {
    if (element.type === 'radio' || element.type === 'checkbox') {
      element.checked = currentValue === element.value;
    } else {
      if (element.value !== currentValue) {
        element.value = currentValue;
      }
    }
  } else if (element.tagName === 'SELECT') {
    if (element.value !== currentValue) {
      element.value = currentValue;
    }
  }
}
