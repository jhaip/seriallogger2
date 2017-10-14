import { debounce } from 'lodash';
import fetch from 'isomorphic-fetch'
import moment from 'moment'
import { getUtcDateString } from '../utils/time'
import { saveView } from './ViewActions'
import { fetchAnnotationsForDetailDataAction } from './AnnotationActions'
import { computeDerivativeSource } from './DerivativeSourceActions'
import { fetchData } from './DataActions'

export const CHANGE_SELECTION_RANGE = 'CHANGE_SELECTION_RANGE'
export const CHANGE_SELECTED_SOURCE = 'CHANGE_SELECTED_SOURCE'
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

const debouncedFetchDetailData = debounce((dispatch, getState) => {
    const selectedSource = getState().selected.source;
    dispatch(fetchDetailData(selectedSource));
    // TODO: readd these nicely
    // dispatch(fetchAnnotationsForDetailDataAction(selectedSource));
    // dispatch(saveView());
  },
  1000
);
const debouncedFetchDetailDataAction = () => debouncedFetchDetailData;

export function fetchDetailData(source) {
  return (dispatch, getState) => {
    const { start, end } = getState().selected;
    dispatch(fetchData(source, start, end));
  }
}
