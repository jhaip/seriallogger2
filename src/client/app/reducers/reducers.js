import { combineReducers } from 'redux'
import ViewReducer from './ViewReducer'
import SelectedReducer from './SelectedReducer'
import NotebookReducer from './NotebookReducer'
import DataReducer from './DataReducer'
import DataViewReducer from './DataViewReducer'

const rootReducer = combineReducers({
  view: ViewReducer,
  selected: SelectedReducer,
  notebook: NotebookReducer,
  data: DataReducer,
  dataview: DataViewReducer
})

export default rootReducer
