import { combineReducers } from 'redux'
import ViewReducer from './ViewReducer'
import SelectedReducer from './SelectedReducer'

const rootReducer = combineReducers({
  view: ViewReducer,
  selected: SelectedReducer
})

export default rootReducer
