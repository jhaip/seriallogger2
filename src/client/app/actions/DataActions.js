import moment from 'moment'
import fetch from 'isomorphic-fetch'
import { getUtcDateString } from '../utils/time'
import { computeDerivativeSource } from './DerivativeSourceActions'

export const RECEIVE_DATA = 'RECEIVE_DATA'
export const RECEIVE_DATA_ANNOTATIONS = 'RECEIVE_DATA_ANNOTATIONS'

function getCleanedSourceData(source, json) {
  let clean_data;
  if (source.name === "annotations") {
    clean_data = json.results.map(d => {
      const value = `${d.annotation}\r\nSource: ${d.source}\r\nStart: ${d.start_timestamp}\r\nEnd: ${d.end_timestamp}`;
      return {
        value: value,
        id: d.id,
        type: "Annotation",
        timestamp: d.timestamp
      };
    });
  } else if (source.name === "view" ||
             source.name === "serial") {
    clean_data = json.results.map(d => {
      let datum = d.value;
      if (datum.slice(-2) === "\r\n") {
        datum = datum.slice(0, -2);
      }
      return {
        value: datum,
        id: d.id,
        type: d.type,
        timestamp: d.timestamp,
        overflow: d.overflow ? JSON.parse(d.overflow) : {}
      };
    });
  } else if (!!source.transform_function) {
    console.log("computing source with transform_function");
    console.log(source);
    clean_data = computeDerivativeSource(json, source.transform_function);
  }

  // clean up dates
  clean_data = clean_data.map(d => {
    d.timestamp = moment.utc(d.timestamp).toDate()
    d.source = source;
    return d;
  });

  return clean_data;
}


export function fetchSourceData(source, start, stop) {
  const url_start = getUtcDateString(start);
  const url_stop = getUtcDateString(stop);
  const url = source.url
    .replace('{{start}}', url_start)
    .replace('{{stop}}', url_stop);
  let options = {
    method: source.request_type || 'GET'
  };
  if (!!source.headers) {
    options.headers = JSON.parse(source.headers);
  }
  if (!!source.body) {
    options.body = JSON.parse(source.body);
  }

  return new Promise((resolve, reject) => {
    fetch(url, options)
      .then(response => response.json())
      .then(json => {
        resolve(getCleanedSourceData(source, json));
      });
  });
}


function fetchDataAnnotations(sourceName, start, stop) {
  if (typeof sourceName !== 'string') {
    console.error("sourceName isn't a string!");
    sourceName = sourceName.name;
  }
  const url_start = getUtcDateString(start);
  const url_stop = getUtcDateString(stop);
  const url = `http://localhost:5000/api/annotations?source=${sourceName}&start=${url_start}&stop=${url_stop}`;
  return new Promise((resolve, reject) => {
    fetch(url)
      .then(response => response.json())
      .then(json => {
        console.log(json);
        resolve(json.results);
      });
  });
}


export function fetchDerivativeSourceData(source, start, stop, state) {
  return new Promise((resolve, reject) => {
    const data = state.view.derivativeSources.find(ds => ds.name === source).data;
    // TODO: filter by start and stop times
    // TODO: fetch data dependencies
    resolve(data);
  });
}


export function fetchDataPurely(sourceNameOrData, start, end, state) {
  let data_promise;
  let sourceName = '';
  let sourceData = '';
  if (typeof sourceNameOrData === 'string') {
    sourceName = sourceNameOrData;
    sourceData = state.view.sources.reduce((acc, s) => {
      return (s.name === sourceName) ? s : acc;
    }, null);
  } else {
    sourceName = sourceNameOrData.name;
    sourceData = sourceNameOrData;
  }
  const isDerivativeSource = state.view.derivativeSources.find(ds => ds.name === sourceName)
  if (isDerivativeSource) {
    data_promise = fetchDerivativeSourceData(sourceName, start, end, state);
  } else {
    data_promise = fetchSourceData(sourceData, start, end);
  }
  return data_promise
}

export function receiveDataAnnotations(source, annotations, start, end) {
  return { type: RECEIVE_DATA_ANNOTATIONS, source, annotations, start, end }
}

export function fetchDataAnnotationsAction(source, start, end) {
  return (dispatch, getState) => {
    return fetchDataAnnotations(source, start, end)
      .then(annotations => {
        dispatch(receiveDataAnnotations(source, annotations, start, end));
      })
  }
}

export function receiveData(source, data, start, end) {
  return { type: RECEIVE_DATA, source, data, start, end }
}

export function fetchData(source, start, end) {
  return (dispatch, getState) => {
    return fetchDataPurely(source, start, end, getState())
      .then(data => {
        dispatch(receiveData(source, data, start, end));
        dispatch(fetchDataAnnotationsAction(source, start, end));
      })
  }
}
