import fetch from 'isomorphic-fetch'

export const RECEIVE_SOURCES_LIST = 'RECEIVE_SOURCES_LIST'

export function receiveSourcesList(sources) {
  return { type: RECEIVE_SOURCES_LIST, sources }
}

export function fetchSourcesList() {
  return (dispatch, getState) => {
    const url = `${window.API_URL}/api/sources`
    fetch(url)
      .then(response => {
        return response.json()
      }, error => {
        console.error(error);
      })
      .then(json => {
        const results = json.results.concat([{
            "description": "Annotations data",
            "headers": "",
            "id": 2,
            "name": "annotations",
            "request_data": "",
            "request_type": "GET",
            "transform_function": "",
            "url": "http://localhost:5000/api/annotations?start={{start}}&stop={{stop}}"
        },
        {
            "description": "view data",
            "headers": "",
            "id": 3,
            "name": "view",
            "request_data": "",
            "request_type": "GET",
            "transform_function": "",
            "url": "http://localhost:5000/api/data?source=view&start={{start}}&stop={{stop}}"
        }]);
        dispatch(receiveSourcesList(results));
      });
  }
}

export function updateDataSource(opts, action) {
  return (dispatch, getState) => {
    const dataSourceOptions = {
      name: opts.name || "Untitled",
      description: opts.description || "",
      dependencies: opts.dependencies || [],
      transform_function_language: opts.transform_function_language || "",
      transform_function: opts.transform_function || "",
      data_type: opts.data_type || ""
    }
    if (typeof(opts.id) !== 'undefined') {
      dataSourceOptions.id = opts.id;
    }
    let url = `${window.API_URL}/api/sources`;
    let update_http_verb = 'POST';
    switch (action) {
      case 'update':
        update_http_verb = 'PUT';
        url += '/'+opts.id;
        break;
      case 'delete':
        update_http_verb = 'DELETE'
        url += '/'+opts.id;
        break;
    }
    const options = {
      method: update_http_verb,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(dataSourceOptions)
    }
    return fetch(url, options)
      .then(response => {
        console.log("saved data source");
      });
  }
}

export function createDerivativeDataSource(name, transform_function, sourceDependencies) {
  return (dispatch, getState) => {
    const opts = {
      name,
      request_type: "DERIVATIVE",
      request_data: JSON.stringify(sourceDependencies),
      transform_function
    }
    return dispatch(updateDataSource(opts, 'create'));
  }
}
