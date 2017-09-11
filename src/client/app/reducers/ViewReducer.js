import moment from 'moment'
import {
  CHANGE_VIEW_RANGE,
  RECEIVE_OVERVIEW_DATA,
  ADD_DERIVATIVE_DATA_SOURCE,
  computeDerivativeSource
} from '../actions/OverviewActions'

const INITIAL_VIEW_STATE = {
    start: moment().subtract(45, 'days').toDate(),
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

export default function view(state = INITIAL_VIEW_STATE, action) {
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
    case ADD_DERIVATIVE_DATA_SOURCE:
      return Object.assign({}, state, {
        sources: state.sources.slice(0).concat([action.sourceName]),
        data: Object.assign({}, state.data, {
            [action.sourceName]: computeDerivativeSource(state.data, action.derivativeFunc)
        })
      })
    default:
      return state
  }
}
