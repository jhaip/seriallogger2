import moment from 'moment'
import fetch from 'isomorphic-fetch'
import { getUtcDateString } from '../utils/time'
import { getSelectionDetails } from '../utils/selection'

export const CHANGE_ACTIVE_ANNOTATION = 'CHANGE_ACTIVE_ANNOTATION'
export const SET_POTENTIAL_ANNOTATION = 'SET_POTENTIAL_ANNOTATION'

export function changeActiveAnnotation(activeAnnotation, dataViewId) {
  return { type: CHANGE_ACTIVE_ANNOTATION, activeAnnotation, dataViewId }
}

export function saveNewAnnotation(annotation) {
  return (dispatch, getState) => {
    const currentSelectionDetails = getState().selected.potential_annotation;
    let data;
    if (currentSelectionDetails === null) {
      // If no text is highlighted, make a global annotation
      // not related to any particular source
      data = {
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
        "annotation": annotation,
        "source": currentSelectionDetails.start.data_source,
        "source_type": currentSelectionDetails.start.data_type,
        "value": "",
        "start_id": currentSelectionDetails.start.data_id,
        "start_timestamp": moment.utc(currentSelectionDetails.start.data_timestamp).toISOString(),
        "start_line": currentSelectionDetails.start.row,
        "start_char": currentSelectionDetails.start.character,
        "end_id": currentSelectionDetails.end.data_id,
        "end_timestamp": moment.utc(currentSelectionDetails.end.data_timestamp).toISOString(),
        "end_line": currentSelectionDetails.end.row,
        "end_char": currentSelectionDetails.end.character,
      };
    }
    const url = `${window.API_URL}/api/annotations`;
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

export function setPotentialAnnotation(dataViewId) {
  return {
    type: SET_POTENTIAL_ANNOTATION,
    potential_annotation: getSelectionDetails(),
    dataViewId
  }
}

export function clearPotentialAnnotation(dataViewId) {
  return {
    type: SET_POTENTIAL_ANNOTATION,
    potential_annotation: null,
    dataViewId
  }
}
