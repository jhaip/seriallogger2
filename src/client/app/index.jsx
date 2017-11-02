import 'babel-polyfill';

import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux'
import configureStore from './configureStore'
import App from './components/App'
import { fetchSourcesList } from './actions/DataSourceActions'
import { Promise } from 'es6-promise';
window.Promise = Promise;

window.API_URL = ""; // "http://localhost:5000";

const store = configureStore()

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root')
)

store.dispatch(fetchSourcesList());
