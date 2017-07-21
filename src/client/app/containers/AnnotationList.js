import { connect } from 'react-redux'
import AnnotationListBase from '../components/AnnotationListBase'

const mapStateToProps = state => {
  return {
    annotations: state.selected.annotations,
    activeAnnotation: String(state.selected.activeAnnotation)
  }
}

const mapDispatchToProps = dispatch => {
  return {
    handleClick: (clicked_annotation_id) => {
      console.log("on annotation item click!");
      dispatch(changeActiveAnnotation(clicked_annotation_id));
    },
    clearActiveAnnotation: () => {
      dispatch(changeActiveAnnotation(""));
    }
  }
}

const AnnotationList = connect(
  mapStateToProps,
  mapDispatchToProps
)(AnnotationListBase)

export default AnnotationList
