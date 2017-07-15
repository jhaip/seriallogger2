import 'babel-polyfill';

import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux'
import vegaSpec__DotTimeline from './vega-spec--dot-timeline';
import { VictoryScatter, VictoryChart, VictoryTheme, VictoryAxis, VictoryBrushContainer } from 'victory';
import configureStore from './configureStore'
import App from './components/App'
import { replaceViewData, fetchDetailData } from './actions'

const store = configureStore()
window.store = store;
window.fetchDetailData = fetchDetailData;

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root')
)


var currentSelectionDetails;

/**
 * Fetch detail data in a particular time range
 * specifically for the "serial" and "view" sources
 */
 // impurities: jQuery, moment
 // category: data fetch
function fetchDetailViewData(source, range) {
    var defer = jQuery.Deferred();
    // stupid thing with js dates by default having the users timezone
    var startString = moment(range[0]).utc().add(moment(range[0]).utcOffset(), 'm').toISOString();
    var stopString = moment(range[1]).utc().add(moment(range[1]).utcOffset(), 'm').toISOString();
    var baseURL = "/api/data";
    $.get(baseURL
        + "?source=" + encodeURIComponent(source)
        + "&start=" + startString
        + "&stop=" + stopString
    ).done(function(d) {
        console.log(d);
        var data = d.results.map(function(rawDataValue) {
            var dataValue = rawDataValue.value;
            if (source === "serial") {
                if (dataValue.substring(dataValue.length-2) === "\r\n") {
                    dataValue = dataValue.substr(0, dataValue.length-2);
                }
            }
            return {
                value: dataValue,
                id: rawDataValue.id,
                source: source,
                type: rawDataValue.type,
                timestamp: rawDataValue.timestamp,
            };
        });
        defer.resolve(data);
    }).fail(function(e) {
        defer.reject(e);
    });
    return defer;
}

/**
 * Fetch detail data for the "Annotation" source in a time range
 */
 // impurities: jQuery, moment
 // category: data fetch
function fetchDetailViewAnnotations(source, range) {
    var defer = jQuery.Deferred();
    // stupid thing with js dates by default having the users timezone
    var baseURL = "/api/annotations";
    console.log(moment(range[0]).utc().add(moment(range[0]).utcOffset(), 'm').toISOString());
    console.log(moment(range[0]).utc().toISOString());
    var startString = moment(range[0]).utc().toISOString();
    var stopString = moment(range[1]).utc().toISOString();
    $.get(baseURL
        + "?start=" + startString
        + "&stop=" + stopString
    ).done(function(d) {
        console.log(d);
        var data = d.results.map(function(rawDataValue) {
            return {
                value: rawDataValue.annotation,
                id: rawDataValue.id,
                source: source,
                type: "Annotation",
                timestamp: rawDataValue.timestamp,
            };
        });
        defer.resolve(data);
    }).fail(function(e) {
        defer.reject(e);
    });
    return defer;
}

/**
 * Fetch detail data for the "Code" source in a time range
 */
 // impurities: jQuery, moment, Cookies, d3
 // category: data fetch
function fetchDetailViewCode(source, range) {
    var defer = jQuery.Deferred();
    var auth_token = Cookies.get('smv-github');
    if (!auth_token) {
        throw new Error('MISSING GITHUB AUTH TOKEN!');
    }
    var startString = moment(range[0]).utc().add(moment(range[0]).utcOffset(), 'm').toISOString();
    var stopString = moment(range[1]).utc().add(moment(range[1]).utcOffset(), 'm').toISOString();
    $.ajax({
        type: "GET",
        url: "https://api.github.com/repos/jhaip/seriallogger2/commits",
        headers: {
            "Authorization": "Basic "+btoa("jhaip:"+auth_token)
        },
        data: {
            sha: "master",
            path: "photon/",
            since: startString,
            until: stopString,
        }
    }).done(function(commits) {
        var parseTime = d3.timeParse("%Y-%m-%dT%H:%M:%SZ");
        var data = commits.map(function(c) {
            var value = c.commit.message;
            value += "\r\n" + c.commit.url;
            return {
                value: value,
                id: c.sha,
                source: source,
                type: "code",
                timestamp: parseTime(c.commit.author.date),
            };
        });
        defer.resolve(data);
    }).fail(function(err) {
        defer.reject(e);
    });
    return defer;
}

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

// impurities: jQuery, moment, impure function calls, jQuery selects
// category: view AND data fetch
function detailViewNew(source, range) {
    $(".selected-view__title").text("Detail view on "+source);
    var timestampText0 = moment(range[0]).format("dddd, MMMM Do YYYY, h:mm:ss a");
    var timestampText1 = moment(range[1]).format("dddd, MMMM Do YYYY, h:mm:ss a");
    $(".selected-view__timestamp").text(timestampText0 + " - " + timestampText1);
    $(".selected-view__new-annotation-selection").empty();
    $(".selected-view__data").empty();

    var dataRequest;
    if (source === "serial" ||
        source === "view") {
        dataRequest = fetchDetailViewData(source, range);
    } else if (source === "annotations") {
        dataRequest = fetchDetailViewAnnotations(source, range);
    } else if (source === "code") {
        dataRequest = fetchDetailViewCode(source, range);
    }

    dataRequest.done(function(data) {
        renderDetailViewTextView(data);
        showAnnotationsOnDetailView(source, range);
    });

    saveView(source, range);
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

function makeOnDomainChangeHandler(source) {
    return _.debounce(function(details) {
        console.log(details);
        if (details) {
            detailViewNew(source, details.x);
        }
    }, 500);
}

// impurities: d3, impure functions, underscore, moment
// category: view
function showSerialDataTimeline() {
    d3.json("/api/data?source=serial", function(data) {
        var view_serialLogs = createTimeline("signals-overview__signal--serial-logs",
                                             900,
                                             [moment("2017-06-11T18:42:24", moment.ISO_8601).toDate(), moment().toDate()],
                                             data.results,
                                             makeOnDomainChangeHandler("serial"));
        store.dispatch(replaceViewData("serial-logs", data.results));

    });
}
// impurities: d3, impure functions, underscore, jQuery, moment
// category: view
function showAnnotationDataTimeline() {
    d3.json("/api/annotations", function(data) {
        if (data.results.length > 0) {
            var view_annotations = createTimeline("signals-overview__signal--annotations",
                                                  900,
                                                  [moment("2017-06-11T18:42:24", moment.ISO_8601).toDate(), moment().toDate()],
                                                  data.results,
                                                  makeOnDomainChangeHandler("annotations"));
            store.dispatch(replaceViewData("annotations", data.results));
        } else {
            $("signals-overview__signal--annotations").text("No annotations");
        }
    });
}

// impurities: d3, impure functions, underscore, moment
// category: view
function showViewDataTimeline() {
    d3.json("/api/data?source=view", function(data) {
        var view_view = createTimeline("signals-overview__signal--view",
                                       900,
                                       [moment("2017-06-11T18:42:24", moment.ISO_8601).toDate(), moment().toDate()],
                                       data.results,
                                       makeOnDomainChangeHandler("view"));
        store.dispatch(replaceViewData("view", data.results));
    });
}

// impurities: jQuery, Cookies, d3, moment, etc
// category: view
function showCodeTimeline() {
    var auth_token = Cookies.get('smv-github');
    if (!auth_token) {
        throw new Error('MISSING GITHUB AUTH TOKEN!');
    }
    $.ajax({
        type: "GET",
        url: "https://api.github.com/repos/jhaip/seriallogger2/commits",
        headers: {
            "Authorization": "Basic "+btoa("jhaip:"+auth_token)
        },
        data: {
            sha: "master",
            path: "photon/"
        }
    }).done(function(commits) {
        var parseTime = d3.timeParse("%Y-%m-%dT%H:%M:%SZ");
        var data = commits.map(function(c) {
            return {
                "timestamp": parseTime(c.commit.author.date),
                "label": c.commit.message,
                "commit": c.sha
            };
        });
        console.log(data);

        var view_code = createTimeline("signals-overview__signal--code",
                                       900,
                                       [moment("2017-06-11T18:42:24", moment.ISO_8601).toDate(), moment().toDate()],
                                       data,
                                       makeOnDomainChangeHandler("code"));
        store.dispatch(replaceViewData("code", data));
    }).fail(function(err) {
        console.error(err);
    });
}

// impurities: impure functions
// category: view
function showData() {
    showSerialDataTimeline();
    showAnnotationDataTimeline();
    showViewDataTimeline();
    showCodeTimeline();
}
showData();


function renderDetailViewTextView(data) {
    ReactDOM.render(
      <DetailViewText data={data} />,
      document.getElementById('selected-view__data')
    );
}

class DetailViewTextRow extends React.Component {
    render() {
      return (
          <pre className={"row row-rn-"+this.props.id}
               data-rn={this.props.rowNumber}
               data-dataid={this.props.id}
               data-datasource={this.props.dataSource}
               data-datatype={this.props.dataType}
               data-datatimestamp={this.props.dataTimestamp} >
            {this.props.text}
          </pre>
      );
    }
}

class DetailViewTimestampRow extends React.Component {
    render() {
      const text = moment(this.props.timestamp).fromNow();
      return (
          <div className="timestamp-row noselect">
            {text}
          </div>
      );
    }
}

let rn = 0; // BAD global state replace!
class DetailViewTimeGroup extends React.Component {
    render() {
      let listRows = [];
      let lines = this.props.value.split(/\r\n/);
      for (let i = 0; i < lines.length; i+=1) {
          let subline = lines[i].split(/\n/);
          for (let y = 0; y < subline.length; y+=1) {
              listRows.push((
                <DetailViewTextRow id={this.props.id}
                                   key={rn}
                                   rowNumber={rn}
                                   dataSource={this.props.source}
                                   dataType={this.props.type}
                                   dataTimestamp={this.props.timestamp}
                                   text={subline[y]} />
              ));
              rn += 1;
          }
      }
      return (
          <div>
            <DetailViewTimestampRow timestamp={this.props.timestamp} />
            {listRows}
          </div>
      );
    }
}

class DetailViewText extends React.Component {
    render() {
      const listRows = this.props.data.map((d) =>
        <DetailViewTimeGroup key={d.id} {...d} />
      );
      return (
          <div>
            {listRows}
          </div>
      );
    }
}

class AnnotationView extends React.Component {
  constructor(props) {
    super(props);
    this.onAddAnnotation = this.onAddAnnotation.bind(this);
    this.onSaveAnnotation = this.onSaveAnnotation.bind(this);
    this.onCancelAnnotation = this.onCancelAnnotation.bind(this);
  }

  onAddAnnotation(e) {
    e.preventDefault();
    currentSelectionDetails = markSelection();
    clearTextSelection();
    $(".selected-view__new-annotation-input-container").show();
    $(".selected-view__new-annotation-input").focus();
  }

  onSaveAnnotation(e) {
    e.preventDefault();
    onSaveAnnotation();
  }

  onCancelAnnotation(e) {
    e.preventDefault();
    onCancelAnnotation();
  }

  render() {
    return (
        <div>
            <input type="submit"
                   value="Add Annotation"
                   className="selected-view__data-add-annotation"
                   onClick={this.onAddAnnotation} />
            <div className="selected-view__new-annotation-input-container">
                <input type="text" className="selected-view__new-annotation-input" />
                <div>
                    <input type="submit"
                           value="Save"
                           className="selected-view__data-save-annotation"
                           onClick={this.onSaveAnnotation} />
                    <input type="submit"
                           value="Cancel"
                           className="selected-view__data-cancel-add-annotation"
                           onClick={this.onCancelAnnotation} />
                </div>
            </div>
        </div>
    );
  }
}

class SelectedView extends React.Component {
  render() {
    return (
        <div>
            <h3>Selected View: <span className="selected-view__title">{this.props.title}</span></h3>
            <p className="selected-view__timestamp">{this.props.timestamp}</p>
            <div className="selected-view__data-container">
                <div id="selected-view__data"></div>
                <div className="selected-view__data-annotations-col">
                    <AnnotationView />
                </div>
            </div>
        </div>
    );
  }
}

ReactDOM.render(
  <SelectedView title="Code commit a81sflj0"
                timestamp="9:43pm 6/12/2017" />,
  document.getElementById('selected-view')
);

class DataOverviewTimeline extends React.Component {
    render() {
        return (
          <div>
            <VictoryChart
              padding={{top: 0, left: 20, right: 20, bottom: 30}}
              width={this.props.width}
              height={60}
              domain={{y: [0,1]}}
              domainPadding={{x: 30}}
              scale={{x: "time"}}
              containerComponent={
                <VictoryBrushContainer responsive={false}
                  dimension="x"
                  onDomainChange={this.props.onDomainChange}
                />
              }
            >
              <VictoryAxis
                tickFormat={(x) => moment(x).format('h:mm:ss')}
                style={{
                  ticks: {stroke: "grey", size: 5},
                }}
              />
              <VictoryScatter
                data={this.props.data}
                x={(datum) => new Date(datum.timestamp)}
                y={(datum) => 0}
              />
            </VictoryChart>
          </div>
        )
    }
}

function createTimeline(elSelector, width, domain, data, onDomainChange) {
    // if (elSelector !== "signals-overview__signal--code") return;
    var timestampData = data.map((d) => ({"timestamp": d.timestamp}));
    ReactDOM.render(
      <DataOverviewTimeline
        width={width}
        data={timestampData}
        onDomainChange={onDomainChange}
      />,
      document.getElementById(elSelector)
    );
}
