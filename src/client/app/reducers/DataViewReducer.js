import moment from 'moment'
import {
  CHANGE_DATAVIEW_VISUALTYPE,
  CHANGE_DATAVIEW_START,
  CHANGE_DATAVIEW_STOP,
  CHANGE_DATAVIEW_SOURCENAMES
} from '../actions/DataViewActions'

const INITIAL_VIEW_STATE = {
    views: [
      {
        sourceNames: ['view'],
        start: moment().subtract(5, 'days').toDate(),
        stop: moment().subtract(1, 'minute').toDate(),
        visualType: "raw",
        id: 'e146218e-90ed-490c-8cca-910d7d07c82e'
      },
      {
        sourceNames: ['NeoBLU', 'NeoGRN'],
        start: moment().subtract(50, 'days').toDate(),
        stop: moment().subtract(1, 'days').toDate(),
        visualType: "derivative",
        id: '2c92b120-af09-49a2-9378-11ecdf62a170'
      }
    ]
};

function createUpdatedDataView(state, action, attr) {
  return Object.assign({}, state, {
    views: state.views.map(view => {
      if (view.id === action.dataViewId) {
        return Object.assign({}, view, {
          [attr]: action[attr]
        })
      }
      return view;
    })
  });
}

export default function dataview(state = INITIAL_VIEW_STATE, action) {
  switch (action.type) {
    case CHANGE_DATAVIEW_VISUALTYPE:
      return createUpdatedDataView(state, action, 'visualType');
    case CHANGE_DATAVIEW_START:
      return createUpdatedDataView(state, action, 'start');
    case CHANGE_DATAVIEW_STOP:
      return createUpdatedDataView(state, action, 'stop');
    case CHANGE_DATAVIEW_SOURCENAMES:
      return createUpdatedDataView(state, action, 'sourceNames');
    default:
      return state
  }
}
