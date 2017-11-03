import React from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'
import { connect } from 'react-redux'
import { fetchNotebookEntries, createNotebookEntry } from '../../actions/NotebookActions'
import NotebookEntryListItem from './NotebookEntryListItem'

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

class NotebookList extends React.Component {
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
NotebookList.propTypes = {
  entries: PropTypes.array.isRequired,
  onCreateEntry: PropTypes.func.isRequired
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(NotebookList)
