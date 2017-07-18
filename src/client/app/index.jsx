import 'babel-polyfill';

import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux'
import vegaSpec__DotTimeline from './vega-spec--dot-timeline';
import configureStore from './configureStore'
import App from './components/App'
import { fetchOverviewData, fetchDetailData, changeActiveAnnotation } from './actions'

const store = configureStore()
window.store = store;
window.fetchDetailData = fetchDetailData;
window.changeActiveAnnotation = changeActiveAnnotation;

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root')
)

store.dispatch(fetchOverviewData("code"));
store.dispatch(fetchOverviewData("serial"));
store.dispatch(fetchOverviewData("annotations"));
store.dispatch(fetchOverviewData("view"));



var currentSelectionDetails;


// impurities: moment, mark()
// category: data fetch AND view
function showAnnotationsOnDetailView(source, range) {
    var startString = moment(range[0]).utc().toISOString();
    var stopString = moment(range[1]).utc().toISOString();
    $.get("/api/annotations"
        + "?source=" + encodeURIComponent(source)
        + "&start=" + startString
        + "&stop=" + stopString).done(function(d) {
        console.log("DETAIL VIEW'S ANNOTATIONS:");
        console.log(d);
        for (var i=0; i<d.results.length; i+=1) {
            var a = d.results[i];
            console.log(a);
            mark({
                "start": {
                    "id": a.start_id,
                    "timestamp": a.start_timestamp,
                    "row": a.start_line,
                    "character": a.start_char,
                },
                "end": {
                    "id": a.end_id,
                    "timestamp": a.end_timestamp,
                    "row": a.end_line,
                    "character": a.end_char,
                },
                "id": a.id
            });
        }
    });
}

// impurities: jQuery
// category: data fetch
function saveView(selectedSource, selectedRange) {
    var viewDescription = {
        "selectedSource": selectedSource,
        "selectedRange": selectedRange
    };
    jQuery.ajax({
        type: "POST",
        url: "/api/data",
        data: JSON.stringify({
            "source": "view",
            "value": JSON.stringify(viewDescription),
            "type": "View"
        }),
        dataType: "json",
        contentType: "application/json"
    }).done(function() {
        console.log("success saving view");
    }).fail(function(e) {
        console.error(e);
    });
}

// impurities: jQuery, moment, impure function calls, jQuery selects
// category: view AND data fetch
function onSaveAnnotation() {
    console.log("save")
    console.log(currentSelectionDetails);
    var data = {
        "timestamp": moment().utc().toISOString(),
        "annotation": $(".selected-view__new-annotation-input").val(),
        "source": currentSelectionDetails.start.data_source,
        "source_type": currentSelectionDetails.start.data_type,
        "value": "",
        "start_id": currentSelectionDetails.start.data_id,
        "start_timestamp": currentSelectionDetails.start.data_timestamp,
        "start_line": currentSelectionDetails.start.row,
        "start_char": currentSelectionDetails.start.character,
        "end_id": currentSelectionDetails.end.data_id,
        "end_timestamp": currentSelectionDetails.end.data_timestamp,
        "end_line": currentSelectionDetails.end.row,
        "end_char": currentSelectionDetails.end.character,
    };
    console.log(data);
    jQuery.ajax({
        type: "POST",
        url: "/api/annotations",
        data: JSON.stringify(data),
        dataType: "json",
        contentType: "application/json"
    }).done(function() {
        console.log("success saving annotation");
    }).fail(function(e) {
        console.error(e);
    });

    $(".selected-view__new-annotation-input-container").hide();
    $(".selected-view__new-annotation-input").val("");
}

// category: view
function onCancelAnnotation() {
    $(".selected-view__new-annotation-input-container").hide();
    $(".selected-view__new-annotation-input").val("");
    unmark(currentSelectionDetails.id);
}

// impurities: window
// category: view
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

// PURE function
// category: helper
function guidGenerator() {
    var S4 = function() {
       return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
    };
    return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
}

// impurities: jQuery
// category: view
function unmark(id) {
    $(".selected-text--"+id).each(function() {
        $(this).contents().unwrap();
    });
}

// impurities: jQuery
// category: view helper
function mark(selectionDetails) {
    var specialStartChar = "\u2600";
    var specialEndChar = "\u2601";
    var id = selectionDetails.id;
    var startRow = $('.row').filter(function() {
        // return $(this).data("rn") === selectionDetails.start.row;
        return $(this).data("dataid") === selectionDetails.start.id;
    }).first();
    var endRow = $('.row').filter(function() {
        // return $(this).data("rn") === selectionDetails.end.row;
        return $(this).data("dataid") === selectionDetails.end.id;
    }).first();

    // TODO: currently only works for non overlapping annotations!
    var newStartRowHMTL = [startRow.text().slice(0, selectionDetails.start.character), specialStartChar, startRow.text().slice(selectionDetails.start.character)].join('');
    startRow.text(newStartRowHMTL);
    var newEndRowHMTL = [endRow.text().slice(0, selectionDetails.end.character+1), specialEndChar, endRow.text().slice(selectionDetails.end.character+1)].join('');
    endRow.text(newEndRowHMTL);

    var classString = "selected-text selected-text--"+id;
    if (startRow.is(endRow)) {
        startRow.html(startRow.html()
                              .replace(specialStartChar, "<span class='"+classString+"'>")
                              .replace(specialEndChar, "</span>"));
    } else {
        var currentRow = startRow.nextAll(".row").first();
        startRow.html(startRow.html().replace(specialStartChar, "<span class='"+classString+"'>")+"</span>");
        while (!currentRow.is(endRow) && currentRow.length > 0) {
            currentRow.wrapInner("<span class='"+classString+"'></span >");
            currentRow = currentRow.nextAll(".row").first();
        }
        endRow.html("<span class='"+classString+"'>"+endRow.html().replace(specialEndChar, "</span>"));
    }
}

// impurities: jQuery
// category: view helper
function markSelection() {
    var s = window.getSelection().getRangeAt(0);
    var specialStartChar = "\u2600";
    var specialEndChar = "\u2601";
    var startOffset = s.startOffset;
    var startOffsetParent = $(s.startContainer.parentElement);
    var endOffset = s.endOffset;
    var endOffsetParent = $(s.endContainer.parentElement);

    var rangeCopy, markerEl;
    rangeCopy = s.cloneRange();
    rangeCopy.collapse(true);  // collapse to start
    markerEl = document.createElement("span");
    markerEl.appendChild( document.createTextNode(specialStartChar) );
    rangeCopy.insertNode(markerEl);

    rangeCopy = s.cloneRange();
    rangeCopy.collapse(false);  // collapse to end
    markerEl = document.createElement("span");
    markerEl.appendChild( document.createTextNode(specialEndChar) );
    rangeCopy.insertNode(markerEl);

    var startRow = $(s.startContainer.parentElement).closest(".row");
    var endRow = $(s.endContainer.parentElement).closest(".row");
    var startRowNumber = startRow.data("rn");
    var endRowNumber = endRow.data("rn");
    var startRowDataId = startRow.data("dataid");
    var endRowDataId = endRow.data("dataid");
    var startRowDataSource = startRow.data("datasource");
    var endRowDataSource = endRow.data("datasource");
    var startRowDataType = startRow.data("datatype");
    var endRowDataType = endRow.data("datatype");
    var startRowDataTimestamp = startRow.data("datatimestamp");
    var endRowDataTimestamp = endRow.data("datatimestamp");
    var id = guidGenerator();

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

    var classString = "selected-text selected-text--"+id;
    if (startRow.is(endRow)) {
        startRow.html(startRow.html()
                              .replace("<span>"+specialStartChar+"</span>", "<span class='"+classString+"'>")
                              .replace("<span>"+specialEndChar+"</span>", "</span>"));
    } else {
        var currentRow = startRow.nextAll(".row").first();
        startRow.html(startRow.html().replace("<span>"+specialStartChar+"</span>", "<span class='"+classString+"'>")+"</span>");
        while (!currentRow.is(endRow) && currentRow.length > 0) {
            currentRow.wrapInner("<span class='"+classString+"'></span >");
            currentRow = currentRow.nextAll(".row").first();
        }
        endRow.html("<span class='"+classString+"'>"+endRow.html().replace("<span>"+specialEndChar+"</span>", "</span>"));
    }
    return selectionDetails;
}
