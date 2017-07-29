import {
  fetchDetailDataForData,
  fetchDetailDataForAnnotations,
  fetchDetailDataForCode
} from './DetailActions'

export const CHANGE_VIEW_RANGE = 'CHANGE_VIEW_RANGE'
export const REQUEST_OVERVIEW_DATA = 'REQUEST_OVERVIEW_DATA'
export const RECEIVE_OVERVIEW_DATA = 'RECEIVE_OVERVIEW_DATA'

export function changeViewRange(start, end) {
  return { type: CHANGE_VIEW_RANGE, start, end }
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
