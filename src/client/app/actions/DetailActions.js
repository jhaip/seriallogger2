import { debounce } from 'lodash';
import fetch from 'isomorphic-fetch'
import moment from 'moment'
import Cookies from 'js-cookie'
import { getUtcDateString } from '../utils/time'
import { saveView } from './ViewActions'
import { fetchAnnotationsForDetailDataAction } from './AnnotationActions'
import { computeDerivativeSource } from './DerivativeSourceActions'

export const CHANGE_SELECTION_RANGE = 'CHANGE_SELECTION_RANGE'
export const CHANGE_SELECTED_SOURCE = 'CHANGE_SELECTED_SOURCE'
export const RECEIVE_SELECTED_DATA = 'RECEIVE_SELECTED_DATA'
export const CHANGE_SELECTED_VISUAL_TYPE = 'CHANGE_SELECTED_VISUAL_TYPE'

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
    dispatch(saveView());
  }
}

export function changeSelectedVisualType(visualType) {
  return (dispatch, getState) => {
    dispatch({ type: CHANGE_SELECTED_VISUAL_TYPE, visualType });
    dispatch(saveView());
  }
}

export function receiveDetailData(source, data) {
  return { type: RECEIVE_SELECTED_DATA, source, data }
}

const debouncedFetchDetailData = debounce((dispatch, getState) => {
    const selectedSource = getState().selected.source;
    dispatch(fetchDetailData(selectedSource));
    dispatch(fetchAnnotationsForDetailDataAction(selectedSource));
    dispatch(saveView());
  },
  1000
);
const debouncedFetchDetailDataAction = () => debouncedFetchDetailData;

export function fetchDetailDataForAll(source, start, stop) {
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
        // TODO: pass through source.transform_function
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
        })

        resolve(clean_data);
      });
  });
}

export function fetchDetailDataForUnknown(source, start, stop, state) {
  return new Promise((resolve, reject) => {
    const data = state.view.derivativeSources.find(ds => ds.name === source).data;
    // TODO: filter by start and stop times
    // TODO: fetch data dependencies
    resolve(data);
  });
}

export function fetchDetailDataPurely(sourceNameOrData, start, end, state) {
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
    data_promise = fetchDetailDataForUnknown(sourceName, start, end, state);
  } else {
    data_promise = fetchDetailDataForAll(sourceData, start, end);
  }
  return data_promise
}

export function fetchDetailData(source) {
  return (dispatch, getState) => {
    const { start, end } = getState().selected;
    return fetchDetailDataPurely(source, start, end, getState())
      .then(data => dispatch(receiveDetailData(source, data)))
  }
}
