import { debounce } from 'lodash';
import fetch from 'isomorphic-fetch'
import moment from 'moment'

export const CHANGE_VIEW_RANGE = 'CHANGE_VIEW_RANGE'
export const CHANGE_SELECTION_RANGE = 'CHANGE_SELECTION_RANGE'
export const CHANGE_SELECTED_SOURCE = 'CHANGE_SELECTED_SOURCE'
export const REQUEST_OVERVIEW_DATA = 'REQUEST_OVERVIEW_DATA'
export const RECEIVE_OVERVIEW_DATA = 'RECEIVE_OVERVIEW_DATA'
export const REQUEST_SELECTED_DATA = 'REQUEST_SELECTED_DATA'
export const RECEIVE_SELECTED_DATA = 'RECEIVE_SELECTED_DATA'
export const REQUEST_SELECTED_DATA_ANNOTATIONS = 'REQUEST_SELECTED_DATA_ANNOTATIONS'
export const RECEIVE_SELECTED_DATA_ANNOTATIONS = 'RECEIVE_SELECTED_DATA_ANNOTATIONS'
export const CHANGE_ACTIVE_ANNOTATION = 'CHANGE_ACTIVE_ANNOTATION'
export const SET_POTENTIAL_ANNOTATION = 'SET_POTENTIAL_ANNOTATION'

export function changeViewRange(start, end) {
  return { type: CHANGE_VIEW_RANGE, start, end }
}

export function changeSelectionRange(start, end) {
  return (dispatch, getState) => {
    dispatch({ type: CHANGE_SELECTION_RANGE, start, end });
    dispatch(debouncedFetchDetailDataAction());
  }
}

export function changeSelectedSource(source) {
  return (dispatch, getState) => {
    dispatch({ type: CHANGE_SELECTED_SOURCE, source });
    dispatch(fetchDetailData(source));
    dispatch(fetchAnnotationsForDetailDataAction(source));
  }
}

export function requestOverviewData(source) {
  return { type: REQUEST_OVERVIEW_DATA, source }
}

export function receiveOverviewData(source, data) {
  return { type: RECEIVE_OVERVIEW_DATA, source, data }
}

export function requestDetailData(source) {
  return { type: REQUEST_SELECTED_DATA, source }
}

export function receiveDetailData(source, data) {
  return { type: RECEIVE_SELECTED_DATA, source, data }
}

export function requestDetailDataAnnotations(source) {
  return { type: REQUEST_SELECTED_DATA_ANNOTATIONS, source }
}

export function receiveDetailDataAnnotations(source, data) {
  return { type: RECEIVE_SELECTED_DATA_ANNOTATIONS, source, data }
}

export function changeActiveAnnotation(new_active_annotation) {
  return {
    type: CHANGE_ACTIVE_ANNOTATION,
    active_annotation: new_active_annotation
  }
}

const debouncedFetchDetailData = debounce((dispatch, getState) => {
    const selectedSource = getState().selected.source;
    dispatch(fetchDetailData(selectedSource));
    dispatch(fetchAnnotationsForDetailDataAction(selectedSource));
  },
  1000
);
const debouncedFetchDetailDataAction = () => debouncedFetchDetailData;

function getUtcDateString(date, normalize_timezone=false) {
  let utc_date = moment(date).utc();
  if (normalize_timezone) {
    utc_date.add(moment(date).utcOffset(), 'm');
  }
  return utc_date.toISOString();
}

function fetchDetailDataForData(source, start, stop) {
  const url_source = encodeURIComponent(source);
  const url_start = getUtcDateString(start, true);
  const url_stop = getUtcDateString(stop, true);
  const url = `/api/data`
            + `?source=${url_source}`
            + `&start=${url_start}`
            + `&stop=${url_stop}`;
  return new Promise((resolve, reject) => {
    fetch(url)
      .then(response => response.json())
      .then(json => {
        const clean_data = json.results.map(d => {
          let datum = d.value;
          if (source === "serial" && datum.slice(-2) === "\r\n") {
            datum = datum.slice(0, -2);
          }
          return {
            value: datum,
            id: d.id,
            source: source,
            type: d.type,
            timestamp: d.timestamp
          };
        });
        resolve(clean_data);
      });
  });
}

function fetchDetailDataForAnnotations(source, start, stop) {
  const url_start = getUtcDateString(start);
  const url_stop = getUtcDateString(stop);
  const url = `/api/annotations?start=${url_start}&stop=${url_stop}`;
  return new Promise((resolve, reject) => {
    fetch(url)
      .then(response => response.json())
      .then(json => {
        const clean_data = json.results.map(d => {
          return {
            value: d.annotation,
            id: d.id,
            source: source,
            type: "Annotation",
            timestamp: d.timestamp
          };
        });
        resolve(clean_data);
      });
  });
}

function fetchDetailDataForCode(source, start, stop) {
  var auth_token = Cookies.get('smv-github');
  if (!auth_token) {
      throw new Error('MISSING GITHUB AUTH TOKEN!');
  }
  const url_start = getUtcDateString(start, true);
  const url_stop = getUtcDateString(stop, true);
  const params = {
    sha: "master",
    path: "photon/",
    since: url_start,
    until: url_stop,
  };
  const repo = "jhaip/seriallogger2";
  const urlParams = new URLSearchParams(Object.entries(params));
  const url = `https://api.github.com/repos/${repo}/commits?${urlParams}`;
  const options = {
    headers: {
      "Authorization": "Basic "+btoa("jhaip:"+auth_token)
    }
  }
  return new Promise((resolve, reject) => {
    fetch(url, options)
      .then(response => response.json())
      .then(json => {
        const parseTime = d3.timeParse("%Y-%m-%dT%H:%M:%SZ");
        const clean_data = json.map(c => {
          const value = `${c.commit.message}\r\n${c.commit.url}`;
          return {
              value: value,
              id: c.sha,
              source: source,
              type: "code",
              timestamp: parseTime(c.commit.author.date),
          };
        });
        resolve(clean_data);
      });
  });
}

export function fetchDetailData(source) {
  return (dispatch, getState) => {
    dispatch(requestDetailData(source))
    const { start, end } = getState().selected;
    let data_promise;
    switch (source) {
      case "serial":
      case "view":
        data_promise = fetchDetailDataForData(source, start, end);
        break;
      case "annotations":
        data_promise = fetchDetailDataForAnnotations(source, start, end);
        break;
      case "code":
        data_promise = fetchDetailDataForCode(source, start, end);
        break;
    }
    return data_promise
      .then(data => dispatch(receiveDetailData(source, data)))
  }
}

export function fetchOverviewData(source) {
  return (dispatch, getState) => {
    dispatch(requestOverviewData(source))
    const { start, end } = getState().view;
    let data_promise;
    switch (source) {
      case "serial":
      case "view":
        data_promise = fetchDetailDataForData(source, start, end);
        break;
      case "annotations":
        data_promise = fetchDetailDataForAnnotations(source, start, end);
        break;
      case "code":
        data_promise = fetchDetailDataForCode(source, start, end);
        break;
    }
    return data_promise
      .then(data => dispatch(receiveOverviewData(source, data)))
  }
}

function fetchAnnotationsForDetailData(source, start, stop) {
  const url_source = encodeURIComponent(source);
  const url_start = getUtcDateString(start);
  const url_stop = getUtcDateString(stop);
  const url = `/api/annotations`
    + `?source=${url_source}`
    + `&start=${url_start}`
    + `&stop=${url_stop}`;
  return new Promise((resolve, reject) => {
    fetch(url)
      .then(response => response.json())
      .then(json => {
        const clean_data = json.results.map(d => {
          return {
            "start": {
              "id": d.start_id,
              "timestamp": d.start_timestamp,
              "row": d.start_line,
              "character": d.start_char,
            },
            "end": {
              "id": d.end_id,
              "timestamp": d.end_timestamp,
              "row": d.end_line,
              "character": d.end_char,
            },
            "id": d.id
          };
        });
        resolve(clean_data);
      });
  });
}

export function fetchAnnotationsForDetailDataAction(source) {
  return (dispatch, getState) => {
    dispatch(requestDetailDataAnnotations(source))
    const { start, end } = getState().selected;
    return fetchAnnotationsForDetailData(source, start, stop)
      .then(data => dispatch(receiveDetailDataAnnotations(source, data)))
  }
}

export function saveNewAnnotation(annotation) {
  return (dispatch, getState) => {
    console.log("INSIDE SAVE ANNOATIONS");
    const currentSelectionDetails = getState().selected.potential_annotation;
    console.log(getState());
    console.log(currentSelectionDetails);
    console.log(currentSelectionDetails.start);
    console.log(currentSelectionDetails.start.data_source);
    const data = {
      "timestamp": moment().utc().toISOString(),
      "annotation": annotation,
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
    const url = `/api/annotations`;
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    }
    return new Promise((resolve, reject) => {
      fetch(url, options)
        .then(response => {
          resolve();
        });
    });
  }
}

// PURE function
function guidGenerator() {
    var S4 = function() {
       return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
    };
    return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
}

// impurities: window
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
function getSelectionDetails() {
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

  return selectionDetails;
}

export function setPotentialAnnotation() {
  return {
    type: SET_POTENTIAL_ANNOTATION,
    potential_annotation: getSelectionDetails()
  }
}

export function clearPotentialAnnotation() {
  return {
    type: SET_POTENTIAL_ANNOTATION,
    potential_annotation: null
  }
}
