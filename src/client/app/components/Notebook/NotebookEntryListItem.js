import React from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'
import moment from 'moment'

class NotebookEntryListItem extends React.Component {
  render() {
    const entry_name = (this.props.entry && this.props.entry.name !== "") ? this.props.entry.name : "Untitled";
    return (
      <div className="notebook-entry-summary-item">
        <Link to={`./${this.props.entry.id}`}>
          <h3>{entry_name}</h3>
          { (this.props.entry && this.props.entry.created_at && this.props.entry.last_modified) ?
              <p className="muted">
                <i>Created {moment.utc(this.props.entry.created_at).format("dddd, MMM Do, h:mm a")}</i>,
                <i> edited {moment.utc(this.props.entry.last_modified).format("dddd, MMM Do, h:mm a")}</i>
              </p>
            : null
          }
        </Link>
      </div>
    );
  }
}
NotebookEntryListItem.propTypes = {
  entry: PropTypes.any.isRequired
};

export default NotebookEntryListItem
