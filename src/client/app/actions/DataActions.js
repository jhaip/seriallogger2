import moment from 'moment'
import fetch from 'isomorphic-fetch'
import { getUtcDateString } from '../utils/time'
import { computeDerivativeSource } from './DerivativeSourceActions'

export const RECEIVE_DATA = 'RECEIVE_DATA'
export const RECEIVE_DATA_ANNOTATIONS = 'RECEIVE_DATA_ANNOTATIONS'


function receiveDataAnnotations(source, annotations, start, end) {
  return { type: RECEIVE_DATA_ANNOTATIONS, source, annotations, start, end }
}


function receiveData(source, data, start, end) {
  return { type: RECEIVE_DATA, source, data, start, end }
}


function guid() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }
  return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
    s4() + '-' + s4() + s4() + s4();
}


function applyTranformFunction(source, json) {
  let clean_data = json.results;
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
  }
  // TODO: bring back frontend transform function sometimes?
  //  else if (!!source.transform_function) {
  //   console.log("computing source with transform_function");
  //   console.log(source);
  //   clean_data = computeDerivativeSource(json, source.transform_function);
  // }

  // clean up dates
  clean_data = clean_data.map(d => {
    d.timestamp = moment.utc(d.timestamp).toDate()
    d.source = source;
    d.id = d.id || guid();
    return d;
  });

  return clean_data;
}


function fetchSourceData(source, start, stop) {
  const url_start = getUtcDateString(start);
  const url_stop = getUtcDateString(stop);

  const url = `http://localhost:5000/api/data?source=${source.name}&start=${url_start}&stop=${url_stop}`;
  const options = {method: 'GET'};

  // const url = source.url
  //   .replace('{{start}}', url_start)
  //   .replace('{{stop}}', url_stop);
  // let options = {
  //   method: source.request_type || 'GET'
  // };
  // if (!!source.headers) {
  //   options.headers = JSON.parse(source.headers);
  // }
  // if (!!source.body) {
  //   options.body = JSON.parse(source.body);
  // }

  return new Promise((resolve, reject) => {
    fetch(url, options)
      .then(response => response.json())
      .then(json => {
        console.log(source);
        console.log(json);
        resolve(applyTranformFunction(source, json));
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


export function fetchDataAnnotationsAction(source, start, end) {
  return (dispatch, getState) => {
    return fetchDataAnnotations(source, start, end)
      .then(annotations => {
        dispatch(receiveDataAnnotations(source, annotations, start, end));
      })
  }
}


/* External action to fetch data for a sourceName. Returns nothing.
 * regardless if it is a derivative or not
 * or if the data is fetched from cache or from an external HTTP call
 */
export function fetchData(source, start, end) {
  return (dispatch, getState) => {
    fetchDataOrGetCacheData(source, start, end, getState())
      .then(data => {
        dispatch(receiveData(source, data, start, end));
        dispatch(fetchDataAnnotationsAction(source, start, end));
      })
  }
}


export function fetchDataOrGetCacheData(sourceName, start, end, state) {
  return new Promise((resolve, reject) => {
    const sourceData = state.data[sourceName];
    if (!sourceData) {
      resolve([]);
      return;
    }
    // 1. Check cache
    const cacheData = sourceData.cache;
    const cacheDataMatch = find(cacheData, d => d.start <= start && d.end >= end);
    if (cacheDataMatch) {
      cacheDataMatchInRange = cacheDataMatch.data.filter(d => d.timestamp >= start && d.timestamp <= end);
      resolve(cacheDataMatchInRange);
    } else {
      // 2. fetch data
      if (sourceData.request_type === 'DERIVATIVE') {
        if (typeof sourceData.request_data === 'string' &&
            sourceData.request_data.length > 2) {
          const dataDependencies = JSON.parse(sourceData.request_data);
          const promises = dataDependencies.map(s => {
            return fetchDataOrGetCacheData(s, start, end, state);
          });
          return Promise.all(promises).then(dependencyData => {
            console.log("GOT DERIVATIVE DATA DEPENDENCIES DATA");
            console.log(dependencyData);
            const joinedData = dependencyData.reduce((acc, d) => {
              return acc.concat(d);
            }, []);
            console.log(joinedData);
            const transformedData = applyTranformFunction(sourceData, joinedData);
            console.log(transformedData);
            resolve(transformedData);
          });
        } else {
          return [];
        }
      } else {
        return fetchSourceData(sourceData, start, end)
          .then(data => {
            resolve(data); // resolve has applyTranformFunction() already called
          });
      }
    }
  });
}
