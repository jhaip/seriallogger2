import { combineReducers } from 'redux'
import {
  CHANGE_VIEW_RANGE,
  CHANGE_SELECTION_RANGE,
  CHANGE_SELECTED_SOURCE,
  REPLACE_VIEW_DATA,
  RECEIVE_SELECTED_DATA
} from './actions'

const INITIAL_VIEW_STATE = {
    start: moment().subtract(20, 'days').toDate(),
    end: moment().toDate(),
    sources: [
        "code",
        "serial-logs",
        "annotations",
        "view",
    ],
    data: {
        "code": [],
        "serial-logs": [],
        "annotations": [],
        "view": []
    }
};
const INITIAL_SELECTED_STATE = {
    start: moment().subtract(1, 'days').toDate(),
    end: moment().toDate(),
    source: "annotations",
    data: []
}

function view(state = INITIAL_VIEW_STATE, action) {
  switch (action.type) {
    case CHANGE_VIEW_RANGE:
      return Object.assign({}, state, {
        start: action.start,
        end: action.end
      });
    case REPLACE_VIEW_DATA:
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
        end: action.end
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
    default:
      return state
  }
}

const rootReducer = combineReducers({
  view,
  selected
})

export default rootReducer
