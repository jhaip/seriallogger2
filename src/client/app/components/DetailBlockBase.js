import React from 'react'
import PropTypes from 'prop-types'

class DetailBlockBase extends React.Component {
    render() {
      return (
          <div>
              <h3>Selected View: <span className="selected-view__title">{this.props.selectedSources.toString()}</span></h3>
              <p className="selected-view__timestamp">{moment(this.props.selectionStartTime).fromNow()} to {moment(this.props.selectionEndTime).fromNow()}</p>
              <div className="selected-view__data-container">
                  <div id="selected-view__data"></div>
                  <div className="selected-view__data-annotations-col">
                      TODO
                  </div>
              </div>
          </div>
      );
    }
}
DetailBlockBase.propTypes = {
  selectionStartTime: PropTypes.instanceOf(Date).isRequired,
  selectionEndTime: PropTypes.instanceOf(Date).isRequired,
  selectedSources: PropTypes.arrayOf(PropTypes.string).isRequired,
};

export default DetailBlockBase
