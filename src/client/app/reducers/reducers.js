import { combineReducers } from 'redux'
import ViewReducer from './ViewReducer'
import SelectedReducer from './SelectedReducer'
import NotebookReducer from './NotebookReducer'
import DataReducer from './DataReducer'

const rootReducer = combineReducers({
  view: ViewReducer,
  selected: SelectedReducer,
  notebook: NotebookReducer,
  data: DataReducer
})

export default rootReducer
