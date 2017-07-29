import { connect } from 'react-redux'
import AddAnnotationBlockBase from '../components/AddAnnotationBlockBase'
import {
  setPotentialAnnotation,
  clearPotentialAnnotation,
  saveNewAnnotation
} from '../actions/AnnotationActions'

const mapStateToProps = state => {
  return {}
}

const mapDispatchToProps = dispatch => {
  return {
    onStartAnnotation: () => {
      dispatch(setPotentialAnnotation());
    },
    onStopAnnotation: () => {
      dispatch(clearPotentialAnnotation());
    },
    saveNewAnnotation: (annotation) => {
      return dispatch(saveNewAnnotation(annotation));
    }
  }
}

const AddAnnotationBlock = connect(
  mapStateToProps,
  mapDispatchToProps
)(AddAnnotationBlockBase)

export default AddAnnotationBlock
