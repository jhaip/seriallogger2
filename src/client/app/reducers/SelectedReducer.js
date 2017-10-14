import moment from 'moment'
import {
  RECEIVE_SELECTED_DATA_ANNOTATIONS,
  CHANGE_ACTIVE_ANNOTATION,
  SET_POTENTIAL_ANNOTATION
} from '../actions/AnnotationActions'
import {
  CHANGE_SELECTION_RANGE,
  CHANGE_SELECTED_SOURCE,
  CHANGE_SELECTED_VISUAL_TYPE
} from '../actions/DetailActions'
import { RECEIVE_DATA } from '../actions/DataActions'

const INITIAL_SELECTED_STATE = {
    start: moment().subtract(1, 'days').toDate(),
    end: moment().toDate(),
    source: "",
    data: [],
    annotations: [],
    activeAnnotation: "",
    potential_annotation: null,
    visualType: "raw"
}

export default function selected(state = INITIAL_SELECTED_STATE, action) {
  switch (action.type) {
    case CHANGE_SELECTION_RANGE:
      return Object.assign({}, state, {
        start: action.start,
        end: action.end,
        data: [],
        annotations: []
      })
    case CHANGE_SELECTED_SOURCE:
      return Object.assign({}, state, {
        source: action.source,
        data: [],
        annotations: [],
        activeAnnotation: "",
        potential_annotation: null
      })
    case RECEIVE_DATA:
      return Object.assign({}, state, {
        source: action.source.name || action.source,
        data: action.data
      })
    case RECEIVE_SELECTED_DATA_ANNOTATIONS:
      return Object.assign({}, state, {
        annotations: action.data
      })
    case CHANGE_ACTIVE_ANNOTATION:
      return Object.assign({}, state, {
        activeAnnotation: action.active_annotation
      })
    case SET_POTENTIAL_ANNOTATION:
      return Object.assign({}, state, {
        potential_annotation: action.potential_annotation
      })
    case CHANGE_SELECTED_VISUAL_TYPE:
      return Object.assign({}, state, {
        visualType: action.visualType
      })
    default:
      return state
  }
}
