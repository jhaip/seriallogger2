import moment from 'moment'

const INITIAL_VIEW_STATE = {
    views: [
      {
        sourceNames: ['NeoRED'],
        start: moment().subtract(1, 'days').toDate(),
        end: moment().toDate(),
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
