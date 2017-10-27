import { combineReducers } from 'redux'
import ViewReducer from './ViewReducer'
import SelectedReducer from './SelectedReducer'
import NotebookReducer from './NotebookReducer'
import DataReducer from './DataReducer'
import DataViewReducer from './DataViewReducer'
import DerivativeSourceDefinitionsReducer from './DerivativeSourceDefinitionsReducer'

const rootReducer = combineReducers({
  view: ViewReducer,
  selected: SelectedReducer,
  notebook: NotebookReducer,
  data: DataReducer,
  dataview: DataViewReducer,
  derivativeSourceDefinitions: DerivativeSourceDefinitionsReducer
})

export default rootReducer
