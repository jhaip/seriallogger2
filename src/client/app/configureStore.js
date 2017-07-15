import { createStore, applyMiddleware } from 'redux'
import createDebounce from 'redux-debounce'
import thunkMiddleware from 'redux-thunk'
import { createLogger } from 'redux-logger'
import rootReducer from './reducers'

const loggerMiddleware = createLogger()
const debouncer = createDebounce({
  simple: 1000
});

export default function configureStore(preloadedState) {
  return createStore(
    rootReducer,
    applyMiddleware(
      thunkMiddleware,
      createDebounce,
      loggerMiddleware
    )
  )
}
