import moment from 'moment'
import {
  CHANGE_VIEW_RANGE,
  RECEIVE_OVERVIEW_DATA,
  ADD_DERIVATIVE_DATA_SOURCE,
  RECEIVE_DERIVATIVE_SOURCE_DEFINITIONS,
  RECEIVE_SOURCES_LIST,
  computeDerivativeSource
} from '../actions/OverviewActions'

const INITIAL_VIEW_STATE = {
    start: moment().subtract(45, 'days').toDate(),
    end: moment().toDate(),
    sources: [],
    data: {},
    derivativeSources: {
      definitions: {},
      sources: [],
      data: {}
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
        derivativeSources: Object.assign({}, state.derivativeSources, {
          sources: state.derivativeSources.sources.slice(0).concat([action.sourceName]),
          data: Object.assign({}, state.derivativeSources.data, {
              [action.sourceName]: computeDerivativeSource(state.data, action.derivativeFunc)
          })
        })
      })
    case RECEIVE_DERIVATIVE_SOURCE_DEFINITIONS:
      return Object.assign({}, state, {
        derivativeSources: Object.assign({}, state.derivativeSources, {
          definitions: Object.assign({}, action.sources)
        })
      })
    case RECEIVE_SOURCES_LIST:
      return Object.assign({}, state, {
        sources: action.sources.slice(0),
        data: action.sources.slice(0).reduce((prev, source) => {
          return prev[source] = [];
        }, {})
      })
    default:
      return state
  }
}
