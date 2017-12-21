import fetch from 'isomorphic-fetch'

export function saveView(page, opts) {
  return (dispatch, getState) => {
    console.log("INSIDE SAVE VIEW");
    const data = {
      "data_source": "View",
      "value": {
        "page": page,
        "description": opts
      }
    };
    const url = `${window.API_URL}/api/data`;
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    }
    return new Promise((resolve, reject) => {
      fetch(url, options)
        .then(response => {
          resolve();
        });
    });
  }
}
