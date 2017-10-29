import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { changeActiveAnnotation } from '../actions/AnnotationActions'
import {
  getDataViewDataAnnotations,
  getDataViewActiveAnnotation
} from '../selectors'
import DetailViewTimeGroup from "../components/DetailViewTimeGroup"


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


const mapStateToProps = (state, props) => {
  return {
    annotations: getDataViewDataAnnotations(state, props.dataViewId),
    activeAnnotation: getDataViewActiveAnnotation(state, props.dataViewId)
  }
}

const mapDispatchToProps = (dispatch, props) => {
  return {
    handleClick: (clicked_annotation_id) => {
      console.log("on annotation item click!");
      dispatch(changeActiveAnnotation(String(clicked_annotation_id), props.dataViewId));
    },
    clearActiveAnnotation: () => {
      dispatch(changeActiveAnnotation("", props.dataViewId));
    }
  }
}

class AnnotationList extends React.Component {
  render() {
    let k = 0;
    const list = this.props.annotations.map((annotation) => {
      return <AnnotationListItem key={k++}
                                 annotation={annotation}
                                 activeAnnotation={this.props.activeAnnotation}
                                 handleClick={this.props.handleClick} />
    });
    return (
      <div>
        <strong>Annotations:</strong>
        <div>
          {list}
        </div>
        {(this.props.activeAnnotation === "") ?
          null :
          <button onClick={this.props.clearActiveAnnotation}
                  style={{marginTop: "10px"}}>
            Clear Selection
          </button>}
      </div>
    );
  }
}
AnnotationList.propTypes = {
  annotations: PropTypes.array.isRequired,
  activeAnnotation: PropTypes.string.isRequired,
  handleClick: PropTypes.func.isRequired,
  clearActiveAnnotation: PropTypes.func.isRequired,
  dataViewId: PropTypes.string.isRequired
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(AnnotationList)
