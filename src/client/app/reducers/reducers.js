import { combineReducers } from 'redux'
import NotebookReducer from './NotebookReducer'
import DataReducer from './DataReducer'
import DataViewReducer from './DataViewReducer'
import DerivativeSourceDefinitionsReducer from './DerivativeSourceDefinitionsReducer'

const rootReducer = combineReducers({
  notebook: NotebookReducer,
  data: DataReducer,
  dataview: DataViewReducer,
  derivativeSourceDefinitions: DerivativeSourceDefinitionsReducer
})

export default rootReducer
