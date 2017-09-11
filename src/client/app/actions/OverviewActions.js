import {
  fetchDetailDataForData,
  fetchDetailDataForAnnotations,
  fetchDetailDataForCode
} from './DetailActions'

export const CHANGE_VIEW_RANGE = 'CHANGE_VIEW_RANGE'
export const REQUEST_OVERVIEW_DATA = 'REQUEST_OVERVIEW_DATA'
export const RECEIVE_OVERVIEW_DATA = 'RECEIVE_OVERVIEW_DATA'
export const ADD_DERIVATIVE_DATA_SOURCE = 'ADD_DERIVATIVE_DATA_SOURCE'

export function fetchAllNewOverviewData() {
  return (dispatch, getState) => {
    dispatch(fetchOverviewData("code"));
    dispatch(fetchOverviewData("serial"));
    dispatch(fetchOverviewData("annotations"));
    dispatch(fetchOverviewData("view"));
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

export function addDerivativeDataSource(sourceName, derivativeFunc) {
  return { type: ADD_DERIVATIVE_DATA_SOURCE, sourceName, derivativeFunc }
}

export function computeDerivativeSource(sourceData, funcBody) {
  const func = `(function (sourceData) { ${funcBody} })(sourceData)`;
  console.log(func);
  const result = eval(func);
  console.log(result);
  return result;
}
