import {
  RECEIVE_OVERVIEW_DATA,
  ADD_DERIVATIVE_DATA_SOURCE,
  RECEIVE_DERIVATIVE_SOURCE_DEFINITIONS,
  RECEIVE_SOURCES_LIST,
  computeDerivativeSource,
  RECEIVE_DERIVATIVE_SOURCES
} from '../actions/OverviewActions'
import { partition, uniqWith, isEqual } from 'lodash'

let a = [{v: 1}, {v:3}, {v:5}];
console.log(_.partition(a, v => v.v < 2));
console.log(_.partition(a, v => v.v < 1));

const INITIAL_SELECTED_STATE = {}

// "id":
//   id = db.Column(db.Integer, primary_key=True)
//   name = db.Column(db.String(100), nullable=False)
//   description = db.Column(db.Text, nullable=False)
//   url = db.Column(db.Text, nullable=False)
//   headers = db.Column(db.Text, nullable=False)
//   request_data = db.Column(db.Text, nullable=False)
//   request_type = db.Column(db.String(100), nullable=False)
//   transform_function
//   "cache": [
//     {
//       start,
//       end,
//       data: [
//
//       ],
//       annotations: [
//         ?
//       ]
//     },
//     ...
//   ]
// }

export default function foo(state = INITIAL_SELECTED_STATE, action) {
  switch (action.type) {
    case RECEIVE_SOURCES_LIST:
      let x = action.sources.slice(0).reduce((acc, source) => {
        acc[source.name] = Object.assign({}, source, { cache: [] });
        return acc;
      }, {})
      return Object.assign({}, state, x)
    case RECEIVE_OVERVIEW_DATA:
      const name = action.source.name;
      console.log(`receving data for source ${name}`)
      let oldCacheData = state[name].cache;

      const p = partition(oldCacheData, d => d.end < action.start)
      const oldDataBefore = p[0];
      const oldDataGreaterThanOrEqualStart = p[1];
      const p2 = partition(oldDataGreaterThanOrEqualStart, d => d.start > action.end)
      const oldDataOverlapping = p2[1];
      const oldDataAfter = p2[0];
      let joinedOverlappingData = {
        start: action.start,
        end: action.end,
        data: action.data
      };
      if (oldDataOverlapping.length > 0) {
        joinedOverlappingData = {
          start: new Date(Math.min(oldDataOverlapping[0].start, action.start)),
          end: new Date(Math.max(oldDataOverlapping[oldDataOverlapping.length-1].end, action.end)),
          data: uniqWith(oldDataOverlapping.concat(action.data), isEqual)
        };
      }

      const newCacheData = oldDataBefore.concat(joinedOverlappingData, oldDataAfter)

      return Object.assign({}, state, {
        [name]: Object.assign({}, state[name], {
          cache: newCacheData
        }),
      })
    default:
      return state
  }
}
