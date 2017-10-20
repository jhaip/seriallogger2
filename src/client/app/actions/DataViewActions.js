import moment from 'moment'
import fetch from 'isomorphic-fetch'
import { getUtcDateString } from '../utils/time'
import { getSelectionDetails } from '../utils/selection'

export const CHANGE_DATAVIEW_VISUALTYPE = 'CHANGE_DATAVIEW_VISUALTYPE'
export const CHANGE_DATAVIEW_START = 'CHANGE_DATAVIEW_START'
export const CHANGE_DATAVIEW_STOP = 'CHANGE_DATAVIEW_STOP'
export const CHANGE_DATAVIEW_SOURCENAMES = 'CHANGE_DATAVIEW_SOURCENAMES'

export function changeDataViewVisualType(dataViewId, visualType) {
  return { type: CHANGE_DATAVIEW_VISUALTYPE, dataViewId, visualType }
}

export function changeDataViewStart(dataViewId, start) {
  return { type: CHANGE_DATAVIEW_START, dataViewId, start }
}

export function changeDataViewEnd(dataViewId, stop) {
  return { type: CHANGE_DATAVIEW_STOP, dataViewId, stop }
}

export function changeDataViewSourceNames(dataViewId, sourceNames) {
  return { type: CHANGE_DATAVIEW_VISUALTYPE, dataViewId, sourceNames }
}
