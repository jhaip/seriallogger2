import moment from 'moment'

const INITIAL_VIEW_STATE = {
    views: [
      {
        sourceNames: ['view'],
        start: moment().subtract(5, 'days').toDate(),
        end: moment().subtract(1, 'minute').toDate(),
        visualType: "raw"
      },
      {
        sourceNames: ['NeoBLU', 'NeoGRN'],
        start: moment().subtract(2, 'days').toDate(),
        end: moment().subtract(1, 'days').toDate(),
        visualType: "line graph"
      }
    ]
};

export default function dataview(state = INITIAL_VIEW_STATE, action) {
  return state
}
