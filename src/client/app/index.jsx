import 'babel-polyfill';

import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux'
import vegaSpec__DotTimeline from './vega-spec--dot-timeline';
import configureStore from './configureStore'
import App from './components/App'
import { fetchOverviewData } from './actions'

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

// impurities: jQuery
// category: data fetch
function saveView(selectedSource, selectedRange) {
    var viewDescription = {
        "selectedSource": selectedSource,
        "selectedRange": selectedRange
    };
    jQuery.ajax({
        type: "POST",
        url: "/api/data",
        data: JSON.stringify({
            "source": "view",
            "value": JSON.stringify(viewDescription),
            "type": "View"
        }),
        dataType: "json",
        contentType: "application/json"
    }).done(function() {
        console.log("success saving view");
    }).fail(function(e) {
        console.error(e);
    });
}
