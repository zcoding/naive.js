export default function style (value, element, context) {
  for (let s in value) {
    element.style[s] = value[s];
  }
}
