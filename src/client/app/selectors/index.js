import { createSelector } from 'reselect'

const getSelectedData = (state) => state.selected.data
const getSelectedAnnotations = (state) => state.selected.annotations

function getRowsFromValue(value) {
  let listRows = [];
  let lines = this.props.value.split(/\r\n/);
  let rn = 0;
  for (let i = 0; i < lines.length; i+=1) {
    let subline = lines[i].split(/\n/);
    for (let y = 0; y < subline.length; y+=1) {
      listRows.push({
        id: this.props.id,
        key: rn,
        rowNumber: rn,
        source: this.props.source,
        type: this.props.type,
        timestamp: this.props.timestamp,
        children: [
          {
            text: subline[y],
            annotationGroups: []
          }
        ]
      });
      rn += 1;
    }
  }
  return listRows;
}

// use split to guarantee the split_index
// will be the start or end of a group
// TODO: align to end
function split(children, split_index, align_start=true) {
  let chars_seen = 0;
  let new_children = [];
  for (var child in children) {
    if (chars_seen + child.text.length < split_char) {
      new_children.push(Object.assign({}, child, {
        text: child.text.slice(0, split_index-chars_seen)
      })
      new_children.push(Object.assign({}, child, {
        text: child.text.slice(split_index-chars_seen)
      })
    } else {
      chars_seen += child.text.length;
      new_children.push(child);
    }
  }
  return new_children;
}

function addAnnotation(children, start, end, annotation_id) {
  let chars_seen = 0;
  let new_children = [];
  for (var child in children) {
    if (chars_seen + child.text.length < split_char) {
      new_children.push(Object.assign({}, child, {
        text: child.text.slice(0, split_index-chars_seen)
      })
      new_children.push(Object.assign({}, child, {
        text: child.text.slice(split_index-chars_seen)
      })
    } else {
      chars_seen += child.text.length;
      new_children.push(child);
    }
  }
  return new_children;
}

export const getAnnotatedSelectedDataTree = createSelector(
  [ getSelectedData, getSelectedAnnotations ],
  (data, annotations) => {
    let tree = [];

    // populate initial rows
    for (var datum of data) {
      tree.push(getRowsFromValue(datum.value));
    }

    // annotate rows
    for (var annotation of annotations) {
      // check that data is loaded enough to match annotation
      if (tree.length > annotation.end.row) {
        if (annotation.start.row === annotation.end.row) {
          let newChildren = [];
          let oldChildren = tree[annotation.start.row].children;
          let charactersToAnnotate = annotation.end.character + 1 - annotation.start.character;
          let characterStartOffset = annotation.start.character;
          for (var oldChild in oldChildren) {
            if (oldChild.text.length < characterStartOffset) {
              if (oldChild.text.length <= characterStartOffset + charactersToAnnotate) {
                const c = Object.assign({}, oldChild, {
                  annotationGroups: oldChild.annotationGroups.concat(annotation.id)
                })
                newChildren.push(c);
                charactersToAnnotate -= oldChild.text.length;
              } else {
                // split into two children
                const cWithAnnotation =
                newChildren.push(cWithAnnotation);
                newChildren.push(cWithoutAnnotation);
                charactersToAnnotate = 0;
              }
            } else {
              // keep looking for the child with the right start offset
              characterStartOffset -= oldChild.text.length;
            }
          }
          children: [
            {
              text: subline[y],
              annotationGroups: []
            }
          ]
          children: [
            {
              text: subline[y].slice(0, annotation.start.character),
              annotationGroups: []
            },
            {
              text: subline[y].slice(annotation.start.character, annotation.end.character+1)
              annotationGroups: []
            },
            {
              text: subline[y].slice(annotation.end.character),
              annotationGroups: []
            }
          ]
          tree[annotation.start.row].children = newChildren;
        }
        // for (var row = annotation.start.row; row <= annotation.end.row; row+=1) {
        //
        // }
      }
    }
  }
)
