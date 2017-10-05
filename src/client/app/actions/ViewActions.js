import fetch from 'isomorphic-fetch'

export function saveView() {
  return (dispatch, getState) => {
    console.log("INSIDE SAVE VIEW");
    let page, page_details;
    if (window.location.pathname.indexOf("/notebook") !== -1) {
      page = "notebook";
      const found = window.location.pathname.match(/\/notebook\/(\d+)/);
      if (found !== null) {
        // "/notebook/entry_id"
        console.log(found);
        const entry_id = found[1];
        page_details = {
          "page": "entry",
          "entry": entry_id
        };
      } else {
        // just "/notebook"
        page_details = {
          "page": "list"
        };
      }
    } else if (window.location.pathname === "/") {
      const state = getState();
      page = "overview";
      page_details = {
        "selected": {
          "source": state.selected.source,
          "start": state.selected.start,
          "end": state.selected.end
        },
        "view": {
          "sources": state.view.sources.map(s => s.name),
          "start": state.view.start,
          "end": state.view.end
        }
      };
    }
    const data = {
      "source": "view",
      "value": JSON.stringify({
        "page": page,
        "details": page_details
      }),
      "type": "View"
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
