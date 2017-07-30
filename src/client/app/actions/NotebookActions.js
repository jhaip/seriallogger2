import { debounce } from 'lodash';
import fetch from 'isomorphic-fetch'

export const REQUEST_NOTEBOOK_ENTRIES = 'REQUEST_NOTEBOOK_ENTRIES'
export const RECEIVE_NOTEBOOK_ENTRIES = 'RECEIVE_NOTEBOOK_ENTRIES'
export const REQUEST_NOTEBOOK_ENTRY = 'REQUEST_NOTEBOOK_ENTRY'
export const RECEIVE_NOTEBOOK_ENTRY = 'RECEIVE_NOTEBOOK_ENTRY'
export const UPDATE_NOTEBOOK_ENTRY = 'UPDATE_NOTEBOOK_ENTRY'
export const CREATE_NOTEBOOK_ENTRY = 'CREATE_NOTEBOOK_ENTRY'

export function requestNotebookEntries() {
  return { type: REQUEST_NOTEBOOK_ENTRIES }
}

export function receiveNotebookEntries(data) {
  return { type: RECEIVE_NOTEBOOK_ENTRIES, data }
}

export function requestNotebookEntry() {
  return { type: REQUEST_NOTEBOOK_ENTRY }
}

export function receiveNotebookEntry(data) {
  return { type: RECEIVE_NOTEBOOK_ENTRY, data }
}

export function fetchNotebookEntries() {
  return (dispatch, getState) => {
    dispatch(requestNotebookEntries());
    const url = `/api/notebook/entries`;
    return fetch(url)
      .then(response => response.json())
      .then(json => {
        dispatch(receiveNotebookEntries(json.results))
      });
  }
}

export function fetchNotebookEntry(entry_id) {
  return (dispatch, getState) => {
    dispatch(requestNotebookEntry());
    const url = `/api/notebook/entries/${entry_id}`;
    return fetch(url)
      .then(response => response.json())
      .then(json => {
        console.log(json);
        dispatch(receiveNotebookEntry(json))
      });
  }
}

export function createNotebookEntry() {
  return (dispatch, getState) => {
    const data = {
      name: "",
      text: ""
    }
    const url = `/api/notebook/entries`;
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    }
    return fetch(url, options)
      .then(response => {
        dispatch(fetchNotebookEntries());
      });
  }
}

export function saveNotebookEntry(entry) {
  return (dispatch, getState) => {
    const url = `/api/notebook/entries/${entry.id}`;
    const options = {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(entry)
    }
    return fetch(url, options)
      .then(response => {
        console.log("saved entry");
      });
  }
}

export function updateNotebookEntry(new_entry_text) {
  return (dispatch, getState) => {
    dispatch({
      type: UPDATE_NOTEBOOK_ENTRY,
      text: new_entry_text
    });
    dispatch(debouncedSaveNotebookEntryAction());
  }
}

const debouncedSaveNotebookEntry = debounce((dispatch, getState) => {
    const entry = getState().notebook.active_entry;
    if (entry !== null) {
      dispatch(saveNotebookEntry(entry));
    }
  },
  2000
);
const debouncedSaveNotebookEntryAction = () => debouncedSaveNotebookEntry;
