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
        end: moment().subtract(1, 'minute').toDate(),
        visualType: "raw",
        id: 'e146218e-90ed-490c-8cca-910d7d07c82e'
      },
      {
        sourceNames: ['NeoBLU', 'NeoGRN'],
        start: moment().subtract(2, 'days').toDate(),
        end: moment().subtract(1, 'days').toDate(),
        visualType: "line graph",
        id: '2c92b120-af09-49a2-9378-11ecdf62a170'
      }
    ]
};

export default function dataview(state = INITIAL_VIEW_STATE, action) {
  switch (action.type) {
    case CHANGE_DATAVIEW_VISUALTYPE:
      return Object.assign({}, state, {
        views: state.views.map(view => {
          if (view.id === action.dataViewId) {
            return Object.assign({}, view, {
              visualType: action.visualType
            })
          }
          return view;
        })
      });
    case CHANGE_DATAVIEW_START:
      return todo
    case CHANGE_DATAVIEW_STOP:
      return todo
    case CHANGE_DATAVIEW_SOURCENAME:
      return todo
    default:
      return state
  }
}
