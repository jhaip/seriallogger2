import { connect } from 'react-redux'
import DetailBlockBase from '../components/DetailBlockBase'
import {
  getAnnotatedSelectedDataTree,
  getSelectedViewEmbedCode
} from '../selectors'
import {
  changeSelectedSource,
  copyEmbedForSelectedView,
  changeSelectedVisualType
} from '../actions/DetailActions'

const mapStateToProps = state => {
  return {
    selectionStartTime: state.selected.start,
    selectionEndTime: state.selected.end,
    selectedSource: state.selected.source,
    selectedData: getAnnotatedSelectedDataTree(state),
    selectedAnnotations: state.selected.annotations,
    activeAnnotation: String(state.selected.activeAnnotation),
    availableSources: state.view.sources,
    selected_view_embed_code: getSelectedViewEmbedCode(state),
    selectedVisualType: state.selected.visualType
  }
}

const mapDispatchToProps = dispatch => {
  return {
    onSelectedSourceChange: (source) => {
      dispatch(changeSelectedSource(source))
    },
    onSelectedVisualTypeChange: (visualType) => {
      dispatch(changeSelectedVisualType(visualType))
    }
  }
}

const DetailBlock = connect(
  mapStateToProps,
  mapDispatchToProps
)(DetailBlockBase)

export default DetailBlock
