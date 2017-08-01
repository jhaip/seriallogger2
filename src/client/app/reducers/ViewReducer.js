import moment from 'moment'
import {
  CHANGE_VIEW_RANGE,
  RECEIVE_OVERVIEW_DATA
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
    default:
      return state
  }
}
