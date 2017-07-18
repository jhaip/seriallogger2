import React from 'react'
import PropTypes from 'prop-types'
import DetailViewText from "./DetailViewText"
import AnnotationView from "./AnnotationView"

class DetailBlockBase extends React.Component {
  render() {
    return (
      <div>
        <h3>Selected View: <span className="selected-view__title">{this.props.selectedSource}</span></h3>
        <p className="selected-view__timestamp">{moment(this.props.selectionStartTime).fromNow()} to {moment(this.props.selectionEndTime).fromNow()}</p>
        <div className="selected-view__data-container">
          <div id="selected-view__data">
            <DetailViewText data={this.props.selectedData}
                            activeAnnotation={this.props.activeAnnotation} />
          </div>
          <div className="selected-view__data-annotations-col">
            <AnnotationView />
          </div>
        </div>
      </div>
    );
  }
}
DetailBlockBase.propTypes = {
  selectionStartTime: PropTypes.instanceOf(Date).isRequired,
  selectionEndTime: PropTypes.instanceOf(Date).isRequired,
  selectedSource: PropTypes.string.isRequired,
  selectedData: PropTypes.array.isRequired,
  selectedAnnotations: PropTypes.array.isRequired,
  activeAnnotation: PropTypes.string.isRequired
};

export default DetailBlockBase
