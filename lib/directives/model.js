import { getObjectFromPath } from '../parser';
import { isArray } from '../utils';

function modelSelect(currentValue, element, context) {
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
}

function modelRadio(currentValue, element, context) {
  element.checked = currentValue === element.value;
}

function modelCheckbox(currentValue, element, context) {
  if (isArray(currentValue)) {
    element.checked = currentValue.indexOf(element.value) !== -1;
  } else {
    element.checked = currentValue === element.value;
  }
}

function modelInput(currentValue, element, context) {
  if (element.value !== currentValue) {
    element.value = currentValue;
  }
}

export default function model(value, element, context) {
  const currentValue = getObjectFromPath(context.state, value);
  const tag = element.tagName.toLowerCase();
  const type = element.type;

  if (tag === 'select') {
    modelSelect(currentValue, element, context);
  } else if (tag === 'input' && type === 'radio') {
    modelRadio(currentValue, element, context);
  } else if (tag === 'input' && type === 'checkbox') {
    modelCheckbox(currentValue, element, context);
  } else if (tag === 'textarea' || tag === 'input') {
    modelInput(currentValue, element, context);
  } else {
    // not support
  }
}
