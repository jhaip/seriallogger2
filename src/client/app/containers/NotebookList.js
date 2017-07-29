import React from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'
import { connect } from 'react-redux'
import { fetchNotebookEntries } from '../actions/NotebookActions'

const mapStateToProps = state => {
  return {
    entries: state.notebook.entries
  }
}

const mapDispatchToProps = dispatch => {
  return {
    fetchNotebookEntries: () => {
      dispatch(fetchNotebookEntries())
    }
  }
}

class NotebookListBase extends React.Component {
  componentWillMount() {
    this.props.fetchNotebookEntries();
  }
  render() {
    let list = null;
    if (this.props.entries) {
      list = this.props.entries.map((entry) => {
        return (
          <li>
            <Link to={`./${entry.id}`}>
              {`Entry "${entry.name}" - ${entry.id}`}
            </Link>
          </li>
        )
      });
    }
    return (
      <ul>
        {list}
      </ul>
    );
  }
}
NotebookListBase.propTypes = {
  entries: PropTypes.array.isRequired,
};

const NotebookList = connect(
  mapStateToProps,
  mapDispatchToProps
)(NotebookListBase)

export default NotebookList
