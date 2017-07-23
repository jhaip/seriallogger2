import { combineReducers } from 'redux'
import moment from 'moment'
import {
  CHANGE_VIEW_RANGE,
  CHANGE_SELECTION_RANGE,
  CHANGE_SELECTED_SOURCE,
  RECEIVE_OVERVIEW_DATA,
  RECEIVE_SELECTED_DATA,
  RECEIVE_SELECTED_DATA_ANNOTATIONS,
  CHANGE_ACTIVE_ANNOTATION,
  SET_POTENTIAL_ANNOTATION
} from './actions'

const INITIAL_VIEW_STATE = {
    start: moment().subtract(25, 'days').toDate(),
    end: moment().toDate(),
    sources: [
        "code",
        "serial",
        "annotations",
        "view"
    ],
    data: {
        "code": [],
        "serial": [],
        "annotations": [],
        "view": []
    }
};
const INITIAL_SELECTED_STATE = {
    start: moment().subtract(1, 'days').toDate(),
    end: moment().toDate(),
    source: "serial",
    data: [],
    annotations: [],
    activeAnnotation: "",
    potential_annotation: null
}

function view(state = INITIAL_VIEW_STATE, action) {
  switch (action.type) {
    case CHANGE_VIEW_RANGE:
      return Object.assign({}, state, {
        start: action.start,
        end: action.end
      });
    case RECEIVE_OVERVIEW_DATA:
      return Object.assign({}, state, {
        data: Object.assign({}, state.data, {
            [action.source]: action.data
        })
      })
    default:
      return state
  }
}

function selected(state = INITIAL_SELECTED_STATE, action) {
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
        source: action.source
      })
    case RECEIVE_SELECTED_DATA:
      return Object.assign({}, state, {
        source: action.source,
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
    default:
      return state
  }
}

const rootReducer = combineReducers({
  view,
  selected
})

export default rootReducer
