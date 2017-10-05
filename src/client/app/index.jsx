import 'babel-polyfill';

import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux'
import vegaSpec__DotTimeline from './vega-spec--dot-timeline';
import configureStore from './configureStore'
import App from './components/App'
import { fetchSourcesList } from './actions/OverviewActions'
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
