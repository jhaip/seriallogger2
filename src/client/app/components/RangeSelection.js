import React from 'react'
import PropTypes from 'prop-types'

class RangeSelection extends React.Component {
  render() {
    return (
      <div>
        <div>
          Showing
          {moment(this.props.startTime).fromNow()}
          to
          {moment(this.props.endTime).fromNow()}
        </div>
      </div>
    );
  }
}
RangeSelection.propTypes = {
  startTime: PropTypes.instanceOf(Date).isRequired,
  endTime: PropTypes.instanceOf(Date).isRequired,
  onChange: PropTypes.func.isRequired,
};

export default RangeSelection
