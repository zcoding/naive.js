import { getObjectFromPath } from '../parser';
import { isArray } from '../utils';

export default function model(value, element, context) {
  const currentValue = getObjectFromPath(context.state, value)
  if (element.type === 'radio') {
    element.checked = currentValue === element.value;
  } else if (element.type === 'checkbox') {
    if (isArray(currentValue)) {
      element.checked = currentValue.indexOf(element.value) !== -1;
    } else {
      element.checked = currentValue === element.value;
    }
  } else if (element.tagName === 'SELECT') {
    if (element.multiple) {
      const options = element.options;
      for (let i = 0; i < options.length; ++i) {
        if (currentValue.indexOf(options[i].value) !== -1) {
          options[i].selected = true;
        } else {
          options[i].selected = false;
        }
      }
    } else {
      if (element.value !== currentValue) {
        element.value = currentValue;
      }
    }
  } else {
    if (element.value !== currentValue) {
      element.value = currentValue;
    }
  }
}
