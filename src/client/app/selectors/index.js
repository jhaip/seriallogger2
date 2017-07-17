import { createSelector } from 'reselect'

const getSelectedData = (state) => state.selected.data
const getSelectedAnnotations = (state) => state.selected.annotations

function getRowsFromValue(value, id, source, type, timestamp, startRowNumber) {
  let listRows = [];
  let lines = value.split(/\r\n/);
  let rn = startRowNumber;
  for (let i = 0; i < lines.length; i+=1) {
    let subline = lines[i].split(/\n/);
    for (let y = 0; y < subline.length; y+=1) {
      listRows.push({
        id: id,
        rowNumber: rn,
        source: source,
        type: type,
        timestamp: timestamp,
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

function split(children, split_index, align_start=true) {
  let chars_seen = 0;
  let new_children = [];
  const align_offset = align_start ? 0 : 1;
  for (var child of children) {
    if (split_index + align_offset < chars_seen + child.text.length) {
      const slice_index = split_index - chars_seen + align_offset;
      if (slice_index !== 0) {
        new_children.push(Object.assign({}, child, {
          text: child.text.slice(0, slice_index)
        }));
      }
      if (slice_index < child.text.length) {
        new_children.push(Object.assign({}, child, {
          text: child.text.slice(slice_index)
        }));
      }
    } else {
      new_children.push(child);
    }
    chars_seen += child.text.length;
  }
  return new_children;
}

// assumes start and end of annotation
// already line up with start and end char in children
function addAnnotationToRow(children, start, end, annotation_id) {
  let chars_seen = 0;
  let new_children = [];
  let temp_children = children.slice();
  if (start !== null) {
    temp_children = split(temp_children, start);
  }
  if (end !== null) {
    temp_children = split(temp_children, end, false);
  }
  for (var child of temp_children) {
    if ((start === null || start >= chars_seen) &&
        (  end === null || chars_seen + child.text.length < end)) {
      new_children.push(Object.assign({}, child, {
        annotationGroups: child.annotationGroups.concat(annotation_id)
      }));
    } else {
      new_children.push(child);
    }
    chars_seen += child.text.length;
  }
  return new_children;
}

export const getAnnotatedSelectedDataTree = createSelector(
  [ getSelectedData, getSelectedAnnotations ],
// export const getAnnotatedSelectedDataTree =
  (data, annotations) => {
    let rows = [];

    // populate initial rows
    let rn = 0;
    for (var datum of data) {
      const newRow = getRowsFromValue(datum.value,
                                     datum.id,
                                     datum.source,
                                     datum.type,
                                     datum.timestamp,
                                     rn);
      rn += newRow.length;
      rows = rows.concat(newRow);
    }

    // annotate rows
    for (var annotation of annotations) {
      // check that data is loaded enough to match annotation
      if (rows.length > annotation.end.row) {
        if (annotation.start.row == annotation.end.row) {
          rows[annotation.start.row].children = addAnnotationToRow(rows[annotation.start.row].children,
                                                                   annotation.start.character,
                                                                   annotation.end.character,
                                                                   annotation.id);
        } else {
          rows[annotation.start.row].children = addAnnotationToRow(rows[annotation.start.row].children,
                                                                   annotation.start.character,
                                                                   null,
                                                                   annotation.id);
          for (var i = annotation.start.row + 1; i < annotation.end.row; i += 1) {
            rows[i].children = addAnnotationToRow(rows[i].children,
                                                  null,
                                                  null,
                                                  annotation.id);
          }
          rows[annotation.end.row].children = addAnnotationToRow(rows[annotation.end.row].children,
                                                                 null,
                                                                 annotation.end.character,
                                                                 annotation.id);
        }
      }
    }

    // Group consequtive rows that have the same timestamp
    let newRows = [];
    for (var row of rows) {
      if ((newRows.length === 0) ||
          (newRows[newRows.length-1].timestamp !== row.timestamp)) {
        newRows.push({
          id: row.id,
          source: row.source,
          type: row.type,
          timestamp: row.timestamp,
          rows: [row]
        });
      } else {
        newRows[newRows.length-1].rows.push(row);
      }
    }

    return newRows;
  }
)
