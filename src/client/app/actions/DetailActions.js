import { debounce } from 'lodash';
import fetch from 'isomorphic-fetch'
import moment from 'moment'
import Cookies from 'js-cookie'
import { getUtcDateString } from '../utils/time'
import { saveView } from './ViewActions'
import { fetchAnnotationsForDetailDataAction } from './AnnotationActions'

export const CHANGE_SELECTION_RANGE = 'CHANGE_SELECTION_RANGE'
export const CHANGE_SELECTED_SOURCE = 'CHANGE_SELECTED_SOURCE'
export const REQUEST_SELECTED_DATA = 'REQUEST_SELECTED_DATA'
export const RECEIVE_SELECTED_DATA = 'RECEIVE_SELECTED_DATA'

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

export function fetchDetailDataPurely(source, start, end) {
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
}

export function fetchDetailData(source) {
  return (dispatch, getState) => {
    dispatch(requestDetailData(source))
    const { start, end } = getState().selected;
    return fetchDetailDataPurely(source, start, end)
      .then(data => dispatch(receiveDetailData(source, data)))
  }
}
