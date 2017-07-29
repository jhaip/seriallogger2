import { combineReducers } from 'redux'
import ViewReducer from './ViewReducer'
import SelectedReducer from './SelectedReducer'
import NotebookReducer from './NotebookReducer'

const rootReducer = combineReducers({
  view: ViewReducer,
  selected: SelectedReducer,
  notebook: NotebookReducer
})

export default rootReducer
