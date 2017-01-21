export function diff (oldTree, newTree) {
  var index = 0;
  var patches = {};
  diffWalk(oldTree, newTree, index, patches);
  return patches;
}

function diffWalk (oldTree, newTree, index, patches) {
  var currentPatches = [];
  if (oldTree.tagName === newTree.tagName) {
    var propsPatches = diffProps(oldTree, newTree);
    if (propsPatches) {
      currentPatches.push({type: 'props', props: propsPatches});
    }
  } else {
    currentPatches.push({type: 'replace', node: newTree});
  }
  patches[index] = currentPatches;
}

function diffProps (oldTree, newTree) {
  var oldTreeProps = oldTree.props;
  var newTreeProps = newTree.props;
  var propsPatches = {}, count = 0;
  for (var p in oldTreeProps) {
    if (!newTreeProps.hasOwnProperty(p) || newTreeProps[p] !== oldTreeProps[p]) {
      propsPatches[p] = newTreeProps[p];
      count += 1;
    }
  }
  if (count <= 0) {
    return null;
  }
  return propsPatches;
}
