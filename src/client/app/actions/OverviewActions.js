import {
  fetchDetailDataForData,
  fetchDetailDataForAnnotations,
  fetchDetailDataForCode,
  changeSelectedSource
} from './DetailActions'

export const CHANGE_VIEW_RANGE = 'CHANGE_VIEW_RANGE'
export const REQUEST_OVERVIEW_DATA = 'REQUEST_OVERVIEW_DATA'
export const RECEIVE_OVERVIEW_DATA = 'RECEIVE_OVERVIEW_DATA'
export const ADD_DERIVATIVE_DATA_SOURCE = 'ADD_DERIVATIVE_DATA_SOURCE'
export const RECEIVE_DERIVATIVE_SOURCE_DEFINITIONS = 'RECEIVE_DERIVATIVE_SOURCE_DEFINITIONS'
export const RECEIVE_SOURCES_LIST = 'RECEIVE_SOURCES_LIST'
export const RECEIVE_DERIVATIVE_SOURCES = 'RECEIVE_DERIVATIVE_SOURCES'

export function receiveSourcesList(sources) {
  return { type: RECEIVE_SOURCES_LIST, sources }
}

export function fetchSourcesList() {
  return (dispatch, getState) => {
    const url = `${window.API_URL}/api/sources`
    fetch(url)
      .then(response => {
        return response.json()
      }, error => {
        console.error(error);
      })
      .then(json => {
        dispatch(receiveSourcesList(json.results.concat(["code", "annotations"])));
        dispatch(changeSelectedSource("annotations"));
        dispatch(fetchAllNewOverviewData());
        dispatch(fetchDerivativeSources());
      });
  }
}


export function fetchDerivativeSources() {
  return (dispatch, getState) => {
    const url = `${window.API_URL}/api/derivative_sources`
    fetch(url)
      .then(response => {
        return response.json()
      }, error => {
        console.error(error);
      })
      .then(json => {
        dispatch(receiveDerivativeSources(json.results));
      });
  }
}

export function receiveDerivativeSources(data) {
  return { type: RECEIVE_DERIVATIVE_SOURCES, data }
}

export function fetchAllNewOverviewData() {
  return (dispatch, getState) => {
    getState().view.sources.forEach(source => {
      dispatch(fetchOverviewData(source));
    });
  }
}

export function changeViewRange(start, end) {
  return (dispatch, getState) => {
    dispatch({ type: CHANGE_VIEW_RANGE, start, end });
    dispatch(fetchAllNewOverviewData());
  }
}

export function requestOverviewData(source) {
  return { type: REQUEST_OVERVIEW_DATA, source }
}

export function receiveOverviewData(source, data) {
  return { type: RECEIVE_OVERVIEW_DATA, source, data }
}

export function fetchOverviewData(source) {
  return (dispatch, getState) => {
    dispatch(requestOverviewData(source))
    const { start, end } = getState().view;
    let data_promise;
    switch (source) {
      case "annotations":
        data_promise = fetchDetailDataForAnnotations(source, start, end);
        break;
      case "code":
        data_promise = fetchDetailDataForCode(source, start, end);
        break;
      default:
        data_promise = fetchDetailDataForData(source, start, end);
    }
    return data_promise
      .then(data => dispatch(receiveOverviewData(source, data)))
  }
}

export function addDerivativeDataSource(sourceName, derivativeFunc) {
  return (dispatch, getState) => {
    const url = `${window.API_URL}/api/derivative_sources`
    const data = {
      name: sourceName,
      source_code: derivativeFunc
    }
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    }
    fetch(url, options)
      .then(response => {
        dispatch(fetchDerivativeSources())
      });
  }
}

export function computeDerivativeSource(sourceData, funcBody) {
  try {
    console.log(sourceData);
    const func = `(function (sourceData) { ${funcBody} })(sourceData)`;
    console.log(func);
    const result = eval(func);
    console.log(result);
    return result;
  } catch (e) {
    console.error("error computing derivative source");
    console.error(e);
    return [];
  }
}

export function fetchDerivativeSourceDefinitions() {
  return (dispatch, getState) => {
    const url = `${window.API_URL}/api/derivative_source_definitions`
    let myHeaders = new Headers();
    myHeaders.append('pragma', 'no-cache');
    myHeaders.append('cache-control', 'no-cache');
    fetch(url, {headers: myHeaders})
      .then(response => {
        return response.json()
      }, error => {
        console.error(error);
      })
      .then(json => {
        const results = json.results.reduce((previousValue, currentValue) => {
          previousValue[currentValue.name] = currentValue.source_code;
          return previousValue;
        }, {});
        dispatch(receiveDerivativeSourceDefinitions(results));
      });
  }
}

export function receiveDerivativeSourceDefinitions(sources) {
  return { type: RECEIVE_DERIVATIVE_SOURCE_DEFINITIONS, sources }
}

export function saveDerivativeSourceDefinition(name, sourceCode) {
  return (dispatch, getState) => {
    const url = `${window.API_URL}/api/derivative_source_definitions`
    const data = {
      name,
      source_code: sourceCode
    }
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    }
    fetch(url, options)
      .then(response => {
        dispatch(fetchDerivativeSourceDefinitions())
      });
  }
}

export function deleteDerivativeSourceDefinition(name) {
  return (dispatch, getState) => {
    const url = `${window.API_URL}/api/derivative_source_definitions`
    const data = {
      name
    }
    const options = {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    }
    fetch(url, options)
      .then(response => {
        dispatch(fetchDerivativeSourceDefinitions())
      });
  }
}
