import React from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'
import { connect } from 'react-redux'
import { fetchNotebookEntries, createNotebookEntry } from '../actions/NotebookActions'
import NotebookEntryListItem from '../components/NotebookEntryListItem'

const mapStateToProps = state => {
  return {
    entries: state.notebook.entries
  }
}

const mapDispatchToProps = dispatch => {
  return {
    fetchNotebookEntries: () => {
      dispatch(fetchNotebookEntries())
    },
    onCreateEntry: () => {
      dispatch(createNotebookEntry())
    }
  }
}

class NotebookListBase extends React.Component {
  componentDidMount() {
    this.props.fetchNotebookEntries();
  }
  render() {
    let list = null;
    if (this.props.entries) {
      list = this.props.entries.map((entry) => {
        return (
          <NotebookEntryListItem key={entry.id} entry={entry} />
        )
      });
    }
    return (
      <div>
        {list}
        <input type="Submit"
               onClick={this.props.onCreateEntry}
               value="New Entry"
               readOnly
               style={{marginTop: "10px"}}/>
      </div>
    );
  }
}
NotebookListBase.propTypes = {
  entries: PropTypes.array.isRequired,
  onCreateEntry: PropTypes.func.isRequired
};

const NotebookList = connect(
  mapStateToProps,
  mapDispatchToProps
)(NotebookListBase)

export default NotebookList
