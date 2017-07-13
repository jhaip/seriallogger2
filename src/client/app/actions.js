/*
 * action types
 */

export const CHANGE_VIEW_RANGE = 'CHANGE_VIEW_RANGE'
export const CHANGE_SELECTION_RANGE = 'CHANGE_SELECTION_RANGE'
export const CHANGE_SELECTED_SOURCE = 'CHANGE_SELECTED_SOURCE'
export const REPLACE_VIEW_DATA = 'REPLACE_VIEW_DATA'
/*
 * action creators
 */

export function changeViewRange(start, end) {
  return { type: CHANGE_VIEW_RANGE, start, end }
}

export function changeSelectionRange(start, end) {
  return { type: CHANGE_SELECTION_RANGE, start, end }
}

export function changeSelectedSource(source) {
  return { type: CHANGE_SELECTED_SOURCE, source }
}

export function replaceViewData(source, data) {
  return { type: REPLACE_VIEW_DATA, source, data }
}
