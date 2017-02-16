import { getObjectFromPath } from '../parser';

export default function model(value, element, context) {
  const currentValue = getObjectFromPath(context.state, value);
  if (element.value !== currentValue) {
    element.value = currentValue;
  }
}
