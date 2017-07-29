import fetch from 'isomorphic-fetch'

export const REQUEST_NOTEBOOK_ENTRIES = 'REQUEST_NOTEBOOK_ENTRIES'
export const RECEIVE_NOTEBOOK_ENTRIES = 'RECEIVE_NOTEBOOK_ENTRIES'
export const REQUEST_NOTEBOOK_ENTRY = 'REQUEST_NOTEBOOK_ENTRY'
export const RECEIVE_NOTEBOOK_ENTRY = 'RECEIVE_NOTEBOOK_ENTRY'

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

function fetchNotebookEntries() {
  dispatch(requestNotebookEntries());
  const url = `/api/notebook/entries`;
  return fetch(url)
    .then(response => response.json())
    .then(json => {
      dispatch(receiveNotebookEntries(json.results))
    });
}

function fetchNotebookEntry(entry_id) {
  dispatch(requestNotebookEntry());
  const url = `/api/notebook/entries/${entry_id}`;
  return fetch(url)
    .then(response => response.json())
    .then(json => {
      dispatch(receiveNotebookEntry(json))
    });
}
