import moment from 'moment'
import {
  CHANGE_VIEW_RANGE,
  RECEIVE_OVERVIEW_DATA,
  RECEIVE_SOURCES_LIST,
} from '../actions/OverviewActions'
import {
  ADD_DERIVATIVE_DATA_SOURCE,
  RECEIVE_DERIVATIVE_SOURCE_DEFINITIONS,
  computeDerivativeSource,
  RECEIVE_DERIVATIVE_SOURCES
} from '../actions/DerivativeSourceActions'

const INITIAL_VIEW_STATE = {
    start: moment().subtract(45, 'days').toDate(),
    end: moment().toDate(),
    sources: [],
    data: {},
    derivativeSources: [],
    derivativeSourceDefinitions: {
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
      const newdata = Object.assign({}, state.data, {
          [action.source.name]: action.data
      });
      return Object.assign({}, state, {
        data: newdata,
        derivativeSources: state.derivativeSources.map(ds => {
          return Object.assign({}, ds, {
            data: computeDerivativeSource(newdata, ds.source_code)
          })
        })
      })
    case ADD_DERIVATIVE_DATA_SOURCE:
      return Object.assign({}, state, {
        derivativeSourceDefinitions: Object.assign({}, state.derivativeSourceDefinitions, {
          sources: state.derivativeSourceDefinitions.sources.slice(0).concat([action.sourceName]),
          data: Object.assign({}, state.derivativeSourceDefinitions.data, {
              [action.sourceName]: computeDerivativeSource(state.data, action.derivativeFunc)
          })
        })
      })
    case RECEIVE_DERIVATIVE_SOURCE_DEFINITIONS:
      return Object.assign({}, state, {
        derivativeSourceDefinitions: Object.assign({}, state.derivativeSourceDefinitions, {
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
    case RECEIVE_DERIVATIVE_SOURCES:
      return Object.assign({}, state, {
        derivativeSources: action.data.map(ds => {
          return Object.assign({}, ds, {
            data: computeDerivativeSource(state.data, ds.source_code)
          })
        })
      })
    default:
      return state
  }
}
