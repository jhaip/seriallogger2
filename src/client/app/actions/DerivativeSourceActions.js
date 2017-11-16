export const RECEIVE_DERIVATIVE_SOURCE_DEFINITIONS = 'RECEIVE_DERIVATIVE_SOURCE_DEFINITIONS'
export const RECEIVE_DERIVATIVE_SOURCES = 'RECEIVE_DERIVATIVE_SOURCES'

// TODO: depricate now that derivative sources are saved as regular sources
export function fetchDerivativeSources() {
  return (dispatch, getState) => {
    const url = `${window.API_URL}/api/derivative_sources`
    fetch(url)
      .then(response => {
        return response.json()
      }, error => {
        console.error(error);
      })
      .then(json => {
        dispatch(receiveDerivativeSources(json.results));
      });
  }
}

export function receiveDerivativeSources(data) {
  return { type: RECEIVE_DERIVATIVE_SOURCES, data }
}

export function addDerivativeDataSource(sourceName, derivativeFunc) {
  return (dispatch, getState) => {
    const url = `${window.API_URL}/api/derivative_sources`
    const data = {
      name: sourceName,
      source_code: derivativeFunc
    }
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    }
    fetch(url, options)
      .then(response => {
        dispatch(fetchDerivativeSources())
      });
  }
}

export function computeDerivativeSource(sourceData, funcBody, throwError) {
  try {
    console.log(sourceData);
    const func = `(function (sourceData) { ${funcBody} })(sourceData)`;
    console.log(func);
    const result = eval(func);
    console.log(result);
    return result;
  } catch (e) {
    console.error("error computing derivative source");
    console.error(e);
    if (throwError) {
      throw e;
    }
    return [];
  }
}

export function fetchDerivativeSourceDefinitions() {
  return (dispatch, getState) => {
    const url = `${window.API_URL}/api/derivative_source_definitions`
    let myHeaders = new Headers();
    myHeaders.append('pragma', 'no-cache');
    myHeaders.append('cache-control', 'no-cache');
    fetch(url, {headers: myHeaders})
      .then(response => {
        return response.json()
      }, error => {
        console.error(error);
      })
      .then(json => {
        const results = json.results.reduce((previousValue, currentValue) => {
          previousValue[currentValue.name] = currentValue.source_code;
          return previousValue;
        }, {});
        dispatch(receiveDerivativeSourceDefinitions(results));
      });
  }
}

export function receiveDerivativeSourceDefinitions(sources) {
  return { type: RECEIVE_DERIVATIVE_SOURCE_DEFINITIONS, sources }
}

export function saveDerivativeSourceDefinition(name, sourceCode) {
  return (dispatch, getState) => {
    const url = `${window.API_URL}/api/derivative_source_definitions`
    const data = {
      name,
      source_code: sourceCode
    }
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    }
    fetch(url, options)
      .then(response => {
        dispatch(fetchDerivativeSourceDefinitions())
      });
  }
}

export function deleteDerivativeSourceDefinition(name) {
  return (dispatch, getState) => {
    const url = `${window.API_URL}/api/derivative_source_definitions`
    const data = {
      name
    }
    const options = {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    }
    fetch(url, options)
      .then(response => {
        dispatch(fetchDerivativeSourceDefinitions())
      });
  }
}
