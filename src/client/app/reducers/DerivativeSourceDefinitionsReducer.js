import moment from 'moment'
import {
  RECEIVE_DERIVATIVE_SOURCE_DEFINITIONS,
} from '../actions/DerivativeSourceActions'

const INITIAL_VIEW_STATE = {};

export default function view(state = INITIAL_VIEW_STATE, action) {
  switch (action.type) {
    case RECEIVE_DERIVATIVE_SOURCE_DEFINITIONS:
      return Object.assign({}, action.sources);
    default:
      return state
  }
}
