import React from 'react'
import PropTypes from 'prop-types'

class DetailViewTimestampRow extends React.Component {
    render() {
      const text = moment(this.props.timestamp).fromNow();
      return (
          <div className="timestamp-row noselect">
            {text}
          </div>
      );
    }
}
DetailViewTimestampRow.propTypes = {
  timestamp: PropTypes.string.isRequired
};

export default DetailViewTimestampRow
