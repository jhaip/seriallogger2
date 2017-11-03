import React from 'react'
import PropTypes from 'prop-types'
import AnnotationList from "./AnnotationList"
import AddAnnotationBlock from  "./AddAnnotationBlock"
import FilterSelectViewToSelected from "./FilterSelectViewToSelected"

class AnnotationView extends React.Component {
  render() {
    return (
      <div>
        <div style={{marginBottom: "10px"}}>
          <FilterSelectViewToSelected />
        </div>
        <div style={{marginBottom: "10px"}}>
          <AddAnnotationBlock dataViewId={this.props.dataViewId} />
        </div>
        <AnnotationList dataViewId={this.props.dataViewId} />
      </div>
    );
  }
}
AnnotationView.propTypes = {
  dataViewId: PropTypes.string.isRequired,
};

export default AnnotationView
