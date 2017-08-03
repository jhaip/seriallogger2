function guidGenerator() {
    var S4 = function() {
       return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
    };
    return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
}

function clearTextSelection() {
    // via https://stackoverflow.com/questions/3169786/clear-text-selection-with-javascript
    if (window.getSelection) {
      if (window.getSelection().empty) {  // Chrome
        window.getSelection().empty();
      } else if (window.getSelection().removeAllRanges) {  // Firefox
        window.getSelection().removeAllRanges();
      }
    } else if (document.selection) {  // IE?
      document.selection.empty();
    }
}

// TODO: remove jQuery dependency
export function getSelectionDetails() {
  const selection = window.getSelection();
  if (selection.isCollapsed === true) {
    return null;
  }
  const s = selection.getRangeAt(0);
  clearTextSelection();
  const specialStartChar = "\u2600";
  const specialEndChar = "\u2601";
  const startOffset = s.startOffset;
  const startOffsetParent = $(s.startContainer.parentElement);
  const endOffset = s.endOffset;
  const endOffsetParent = $(s.endContainer.parentElement);

  var rangeCopy, markerEl, markerEl2;
  rangeCopy = s.cloneRange();
  rangeCopy.collapse(true);  // collapse to start
  markerEl = document.createElement("span");
  markerEl.appendChild( document.createTextNode(specialStartChar) );
  rangeCopy.insertNode(markerEl);

  rangeCopy = s.cloneRange();
  rangeCopy.collapse(false);  // collapse to end
  markerEl2 = document.createElement("span");
  markerEl2.appendChild( document.createTextNode(specialEndChar) );
  rangeCopy.insertNode(markerEl2);

  const startRow = $(s.startContainer.parentElement).closest(".row");
  const endRow = $(s.endContainer.parentElement).closest(".row");
  const startRowNumber = startRow.data("rn");
  const endRowNumber = endRow.data("rn");
  const startRowDataId = startRow.data("dataid");
  const endRowDataId = endRow.data("dataid");
  const startRowDataSource = startRow.data("datasource");
  const endRowDataSource = endRow.data("datasource");
  const startRowDataType = startRow.data("datatype");
  const endRowDataType = endRow.data("datatype");
  const startRowDataTimestamp = startRow.data("datatimestamp");
  const endRowDataTimestamp = endRow.data("datatimestamp");
  const id = guidGenerator();

  var selectionDetails = {
      "start": {
          "row": startRowNumber,
          "character": startRow[0].innerText.indexOf(specialStartChar),
          "data_id": startRowDataId,
          "data_source": startRowDataSource,
          "data_type": startRowDataType,
          "data_timestamp": startRowDataTimestamp,
      },
      "end": {
          "row": endRowNumber,
          "character": endRow[0].innerText.replace(specialStartChar, "").indexOf(specialEndChar) - 1,
          "data_id": endRowDataId,
          "data_source": endRowDataSource,
          "data_type": endRowDataType,
          "data_timestamp": endRowDataTimestamp,
      },
      "id": id
  };

  // startRow.html(startRow.html().replace("<span>"+specialStartChar+"</span>", ""));
  // endRow.html(endRow.html().replace("<span>"+specialEndChar+"</span>", ""));

  console.log(selectionDetails);

  $(markerEl).remove();
  $(markerEl2).remove();

  return selectionDetails;
}
