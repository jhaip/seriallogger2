import { debounce } from 'lodash';
import fetch from 'isomorphic-fetch'

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
  return { type: CHANGE_SELECTED_SOURCE, source }
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
    + `start=${url_start}`
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
