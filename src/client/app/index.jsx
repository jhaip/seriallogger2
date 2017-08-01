import 'babel-polyfill';

import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux'
import vegaSpec__DotTimeline from './vega-spec--dot-timeline';
import configureStore from './configureStore'
import App from './components/App'
import { fetchOverviewData } from './actions/OverviewActions'

const store = configureStore()

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root')
)

store.dispatch(fetchOverviewData("code"));
store.dispatch(fetchOverviewData("serial"));
store.dispatch(fetchOverviewData("annotations"));
store.dispatch(fetchOverviewData("view"));
