import moment from 'moment'

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
  return state
}
