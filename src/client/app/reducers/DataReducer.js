import { RECEIVE_SOURCES_LIST } from '../actions/DataSourceActions'
import { RECEIVE_DATA, RECEIVE_DATA_ANNOTATIONS } from '../actions/DataActions'
import {
  RECEIVE_DERIVATIVE_SOURCE_DEFINITIONS,
  computeDerivativeSource,
  RECEIVE_DERIVATIVE_SOURCES
} from '../actions/DerivativeSourceActions'
import { partition, uniqWith, isEqual, find } from 'lodash'

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

function mergeTimeSeriesData(oldCacheData, action) {
  const p = partition(oldCacheData, d => d.end < action.start)
  const oldDataBefore = p[0];
  const oldDataGreaterThanOrEqualStart = p[1];
  const p2 = partition(oldDataGreaterThanOrEqualStart, d => d.start > action.end)
  const oldDataOverlapping = p2[1];
  const oldDataAfter = p2[0];
  let joinedOverlappingData = {
    start: action.start,
    end: action.end,
    data: action.data,
    annotations: []
  };
  if (oldDataOverlapping.length > 0) {
    if (oldDataOverlapping[0].start <= action.start &&
        oldDataOverlapping[0].end >= action.end) {
      // new data is all inside: ignore it
      joinedOverlappingData = oldDataOverlapping[0];
    } else if (oldDataOverlapping[0].start >= action.start &&
               oldDataOverlapping[oldDataOverlapping.length-1].end <= action.end) {
      // everything in oldDataOverlapping is contained by new data, replace all old data
      joinedOverlappingData = {
        start: action.start,
        end: action.end,
        data: action.data,
        annotations: oldDataOverlapping.reduce((acc, d) => {
          return acc.concat(d.annotations)
        }, [])
      };
    } else {
      // should only be 1 overlap that new data extends, take the unique of both
      // or throw and error
      if (oldDataOverlapping.length === 1) {
        joinedOverlappingData = {
          start: new Date(Math.min(oldDataOverlapping[0].start, action.start)),
          end: new Date(Math.max(oldDataOverlapping[oldDataOverlapping.length-1].end, action.end)),
          data: uniqWith(oldDataOverlapping[0].data.concat(action.data), isEqual),
          annotations: oldDataOverlapping[0].annotations
        };
      } else {
        console.error("BAD LOGIC, oldDataOverlapping.length === "+oldDataOverlapping.length);
      }
    }
  }

  const newCacheData = oldDataBefore.concat(joinedOverlappingData, oldDataAfter)
  return newCacheData;
}

function mergeNewAnnotation(oldCacheData, action) {
  const oldCacheDataCopy = oldCacheData.slice(0);
  let matchingRangeItem = find(oldCacheDataCopy, d => d.start <= action.start && d.end >= action.end);
  if (matchingRangeItem) {
    matchingRangeItem.annotations = matchingRangeItem.annotations || [];
    matchingRangeItem.annotations = uniqWith(matchingRangeItem.annotations.concat(action.annotations), isEqual)
  } else {
    console.error("DIDN'T FIND MATCHING RANGE FOR ANNOTATION");
  }
  return oldCacheDataCopy;
}

export default function foo(state = INITIAL_SELECTED_STATE, action) {
  let name, oldCacheData, newCacheData;
  switch (action.type) {
    case RECEIVE_SOURCES_LIST:
      let x = action.sources.slice(0).reduce((acc, source) => {
        acc[source.name] = Object.assign({}, source, { cache: [] });
        return acc;
      }, {})
      return Object.assign({}, state, x)
    case RECEIVE_DATA:
      name = action.source.name || action.source;
      console.log(`receving data for source ${name}`)
      oldCacheData = state[name].cache;
      newCacheData = mergeTimeSeriesData(oldCacheData, action);
      return Object.assign({}, state, {
        [name]: Object.assign({}, state[name], {
          cache: newCacheData
        }),
      });
    case RECEIVE_DATA_ANNOTATIONS:
      name = action.source.name || action.source;
      console.log(`receving data annotations for source ${name}`)
      oldCacheData = state[name].cache;
      newCacheData = mergeNewAnnotation(oldCacheData, action);
      return Object.assign({}, state, {
        [name]: Object.assign({}, state[name], {
          cache: newCacheData
        }),
      });
    default:
      return state
  }
}
