import { fetchDetailDataForAll, changeSelectedSource } from './DetailActions'
import { fetchDerivativeSources } from './DerivativeSourceActions'

export const CHANGE_VIEW_RANGE = 'CHANGE_VIEW_RANGE'
export const REQUEST_OVERVIEW_DATA = 'REQUEST_OVERVIEW_DATA'
export const RECEIVE_OVERVIEW_DATA = 'RECEIVE_OVERVIEW_DATA'
export const RECEIVE_SOURCES_LIST = 'RECEIVE_SOURCES_LIST'

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
        const results = json.results.concat([{
            "description": "Annotations data",
            "headers": "",
            "id": 2,
            "name": "annotations",
            "request_data": "",
            "request_type": "GET",
            "transform_function": "",
            "url": "http://localhost:5000/api/annotations?start={{start}}&stop={{stop}}"
        },
        {
            "description": "view data",
            "headers": "",
            "id": 3,
            "name": "view",
            "request_data": "",
            "request_type": "GET",
            "transform_function": "",
            "url": "http://localhost:5000/api/data?source=view&start={{start}}&stop={{stop}}"
        }]);
        dispatch(receiveSourcesList(results));
        dispatch(fetchAllNewOverviewData());
        dispatch(fetchDerivativeSources());
        if (results.length > 0) {
          dispatch(changeSelectedSource(results[0].name));
        }
      });
  }
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

export function receiveOverviewData(source, data, start, end) {
  return { type: RECEIVE_OVERVIEW_DATA, source, data, start, end }
}

export function fetchOverviewData(source) {
  return (dispatch, getState) => {
    dispatch(requestOverviewData(source))
    const { start, end } = getState().view;
    let data_promise;
    data_promise = fetchDetailDataForAll(source, start, end);
    return data_promise
      .then(data => dispatch(receiveOverviewData(source, data, start, end)))
  }
}
