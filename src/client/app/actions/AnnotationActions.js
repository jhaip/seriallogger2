import moment from 'moment'
import fetch from 'isomorphic-fetch'
import { getUtcDateString } from '../utils/time'
import { getSelectionDetails } from '../utils/selection'

export const REQUEST_SELECTED_DATA_ANNOTATIONS = 'REQUEST_SELECTED_DATA_ANNOTATIONS'
export const RECEIVE_SELECTED_DATA_ANNOTATIONS = 'RECEIVE_SELECTED_DATA_ANNOTATIONS'
export const CHANGE_ACTIVE_ANNOTATION = 'CHANGE_ACTIVE_ANNOTATION'
export const SET_POTENTIAL_ANNOTATION = 'SET_POTENTIAL_ANNOTATION'

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

function fetchAnnotationsForDetailData(source, start, end) {
  const url_source = encodeURIComponent(source);
  const url_start = getUtcDateString(start);
  const url_end = getUtcDateString(end);
  const url = `/api/annotations`
    + `?source=${url_source}`
    + `&start=${url_start}`
    + `&stop=${url_end}`;
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
    return fetchAnnotationsForDetailData(source, start, end)
      .then(data => dispatch(receiveDetailDataAnnotations(source, data)))
  }
}

export function saveNewAnnotation(annotation) {
  return (dispatch, getState) => {
    const currentSelectionDetails = getState().selected.potential_annotation;
    let data;
    if (currentSelectionDetails === null) {
      // If no text is highlighted, make a global annotation
      // not related to any particular source
      data = {
        "timestamp": moment().utc().toISOString(),
        "annotation": annotation,
        "source": "global",
        "source_type": "Global",
        "value": "",
        "start_id": 0,
        "start_timestamp": 0,
        "start_line": 0,
        "start_char": 0,
        "end_id": 0,
        "end_timestamp": 0,
        "end_line": 0,
        "end_char": 0,
      };
    } else {
      data = {
        "timestamp": moment().utc().toISOString(),
        "annotation": annotation,
        "source": currentSelectionDetails.start.data_source,
        "source_type": currentSelectionDetails.start.data_type,
        "value": "",
        "start_id": currentSelectionDetails.start.data_id,
        "start_timestamp": currentSelectionDetails.start.data_timestamp,
        "start_line": currentSelectionDetails.start.row,
        "start_char": currentSelectionDetails.start.character,
        "end_id": currentSelectionDetails.end.data_id,
        "end_timestamp": currentSelectionDetails.end.data_timestamp,
        "end_line": currentSelectionDetails.end.row,
        "end_char": currentSelectionDetails.end.character,
      };
    }
    const url = `/api/annotations`;
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    }
    return new Promise((resolve, reject) => {
      fetch(url, options)
        .then(response => {
          resolve();
        });
    });
  }
}

export function setPotentialAnnotation() {
  return {
    type: SET_POTENTIAL_ANNOTATION,
    potential_annotation: getSelectionDetails()
  }
}

export function clearPotentialAnnotation() {
  return {
    type: SET_POTENTIAL_ANNOTATION,
    potential_annotation: null
  }
}
