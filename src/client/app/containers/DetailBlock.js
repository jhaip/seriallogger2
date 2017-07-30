import { connect } from 'react-redux'
import DetailBlockBase from '../components/DetailBlockBase'
import {
  getAnnotatedSelectedDataTree,
  getSelectedViewEmbedCode
} from '../selectors'
import {
  changeSelectedSource,
  copyEmbedForSelectedView
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
    selected_view_embed_code: getSelectedViewEmbedCode(state)
  }
}

const mapDispatchToProps = dispatch => {
  return {
    onSelectedSourceChange: (source) => {
      dispatch(changeSelectedSource(source))
    }
  }
}

const DetailBlock = connect(
  mapStateToProps,
  mapDispatchToProps
)(DetailBlockBase)

export default DetailBlock
