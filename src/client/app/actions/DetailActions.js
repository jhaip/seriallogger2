import { debounce } from 'lodash';
import fetch from 'isomorphic-fetch'
import moment from 'moment'
import Cookies from 'js-cookie'
import { getUtcDateString } from '../utils/time'
import { saveView } from './ViewActions'
import { fetchAnnotationsForDetailDataAction } from './AnnotationActions'
import { computeDerivativeSource } from './OverviewActions'

export const CHANGE_SELECTION_RANGE = 'CHANGE_SELECTION_RANGE'
export const CHANGE_SELECTED_SOURCE = 'CHANGE_SELECTED_SOURCE'
export const REQUEST_SELECTED_DATA = 'REQUEST_SELECTED_DATA'
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

export function requestDetailData(source) {
  return { type: REQUEST_SELECTED_DATA, source }
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

export function fetchDetailDataForData(source, start, stop) {
  const url_source = encodeURIComponent(source);
  const url_start = getUtcDateString(start);
  const url_stop = getUtcDateString(stop);
  const url = `${window.API_URL}/api/data`
            + `?source=${url_source}`
            + `&start=${url_start}`
            + `&stop=${url_stop}`;
  return new Promise((resolve, reject) => {
    console.log("about to fetch data "+source+" ---- "+url);

    var myHeaders = new Headers();
    myHeaders.append('pragma', 'no-cache');
    myHeaders.append('cache-control', 'no-cache');
    fetch(url, {headers: myHeaders})
      .then(response => {
        return response.json()
      }, error => {
        reject(error);
      })
      .then(json => {
        console.log("got response for fetch data "+source);
        const clean_data = json.results.map(d => {
          let datum = d.value;
          if (datum.slice(-2) === "\r\n") {
            datum = datum.slice(0, -2);
          }
          return {
            value: datum,
            id: d.id,
            source: source,
            type: d.type,
            timestamp: d.timestamp,
            overflow: d.overflow ? JSON.parse(d.overflow) : {}
          };
        });
        resolve(clean_data);
      });
    console.log("after fetch statement for "+source);
  });
}

export function fetchDetailDataForAnnotations(source, start, stop) {
  const url_start = getUtcDateString(start);
  const url_stop = getUtcDateString(stop);
  const url = `${window.API_URL}/api/annotations?start=${url_start}&stop=${url_stop}`;
  return new Promise((resolve, reject) => {
    fetch(url)
      .then(response => response.json())
      .then(json => {
        const clean_data = json.results.map(d => {
          const value = `${d.annotation}\r\nSource: ${d.source}\r\nStart: ${d.start_timestamp}\r\nEnd: ${d.end_timestamp}`;
          return {
            value: value,
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

export function fetchDetailDataForCode(source, start, stop) {
  var auth_token = Cookies.get('smv-github');
  if (!auth_token) {
      throw new Error('MISSING GITHUB AUTH TOKEN!');
  }
  const url_start = getUtcDateString(start);
  const url_stop = getUtcDateString(stop);
  const params = {
    sha: "master",
    path: "photon/",
    since: url_start,
    until: url_stop,
  };
  const repo = "jhaip/seriallogger2";
  const urlParams = new URLSearchParams(Object.entries(params));
  // output:
  // sha=master&path=photon%2F&since=2011-10-05T14%3A48%3A00.000Z&until=2012-11-06T15%3A48%3A00.000Z
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
        const clean_data = json.map(c => {
          const value = `${c.commit.message}\r\n${c.commit.url}`;
          return {
              value: value,
              id: c.sha,
              source: source,
              type: "code",
              timestamp: moment.utc(c.commit.author.date).toDate(),
          };
        });
        resolve(clean_data);
      });
  });
}

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
    // switch (source) {
    //   case "annotations":
    //     data_promise = fetchDetailDataForAnnotations(source, start, end);
    //     break;
    //   case "code":
    //     data_promise = fetchDetailDataForCode(source, start, end);
    //     break;
    //   default:
    //     data_promise = fetchDetailDataForData(source, start, end);
    // }
  }
  return data_promise
}

export function fetchDetailData(source) {
  return (dispatch, getState) => {
    dispatch(requestDetailData(source));
    const { start, end } = getState().selected;
    return fetchDetailDataPurely(source, start, end, getState())
      .then(data => dispatch(receiveDetailData(source, data)))
  }
}
