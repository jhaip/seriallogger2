import { connect } from 'react-redux'
import DetailBlockBase from '../components/DetailBlockBase'
import { getAnnotatedSelectedDataTree } from '../selectors'
import { changeSelectedSource } from '../actions'

const mapStateToProps = state => {
  return {
    selectionStartTime: state.selected.start,
    selectionEndTime: state.selected.end,
    selectedSource: state.selected.source,
    selectedData: getAnnotatedSelectedDataTree(state),
    selectedAnnotations: state.selected.annotations,
    activeAnnotation: String(state.selected.activeAnnotation),
    availableSources: state.view.sources
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
