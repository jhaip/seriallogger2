import fetch from 'isomorphic-fetch'

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
