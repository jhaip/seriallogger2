import React from 'react'
import PropTypes from 'prop-types'
import moment from 'moment'

class DetailViewTimestampRow extends React.Component {
  render() {
    const text = this.props.sourceName + ", " + moment(this.props.timestamp).fromNow();
    return (
      <div className="timestamp-row noselect">
        {text}
      </div>
    );
  }
}
DetailViewTimestampRow.propTypes = {
  timestamp: PropTypes.any.isRequired,
  sourceName: PropTypes.string.isRequired
};

export default DetailViewTimestampRow
