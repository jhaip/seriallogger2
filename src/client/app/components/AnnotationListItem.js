import React from 'react'
import PropTypes from 'prop-types'
import DetailViewTimeGroup from "./DetailViewTimeGroup"

class AnnotationListItem extends React.Component {
  render() {
    let className = "annotation-list__item";
    if (String(this.props.annotation.id) === String(this.props.activeAnnotation)) {
      className += " annotation-list__item--active"
    }
    return (
      <div className={className} onClick={() => this.props.handleClick(this.props.annotation.id)}>
        ({this.props.annotation.id}) {this.props.annotation.annotation}
      </div>
    );
  }
}
AnnotationListItem.propTypes = {
  annotation: PropTypes.object.isRequired,
  activeAnnotation: PropTypes.string.isRequired,
  handleClick: PropTypes.func.isRequired
};

export default AnnotationListItem
