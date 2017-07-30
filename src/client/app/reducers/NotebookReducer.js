import {
  RECEIVE_NOTEBOOK_ENTRIES,
  RECEIVE_NOTEBOOK_ENTRY,
  UPDATE_NOTEBOOK_ENTRY
} from '../actions/NotebookActions'

const INITIAL_NOTEBOOK_STATE = {
    entries: [],
    active_entry: null
};

function NotebookReducer(state = INITIAL_NOTEBOOK_STATE, action) {
  switch (action.type) {
    case RECEIVE_NOTEBOOK_ENTRIES:
      return Object.assign({}, state, {
        entries: action.data
      })
    case RECEIVE_NOTEBOOK_ENTRY:
      return Object.assign({}, state, {
        active_entry: {
          id: action.data.id,
          text: action.data.text
        }
      })
    case UPDATE_NOTEBOOK_ENTRY:
      return Object.assign({}, state, {
        active_entry: Object.assign({}, state.active_entry, {
          text: action.text
        })
      })
    default:
      return state
  }
}

export default NotebookReducer
