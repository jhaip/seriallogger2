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

export function createDataSource(opts) {
  return (dispatch, getState) => {
    const dataSourceOptions = {
      name: opts.name || "Untitled",
      description: opts.description || "",
      url: opts.url || "",
      headers: opts.headers || "",
      request_data: opts.request_data || "",
      request_type: opts.request_type || "",
      transform_function: opts.transform_function || ""
    }
    const url = `${window.API_URL}/api/sources`;
    const options = {
      method: 'POST',
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
    return dispatch(createDataSource(opts));
  }
}
