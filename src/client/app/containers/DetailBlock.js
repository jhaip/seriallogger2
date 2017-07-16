import { connect } from 'react-redux'
import DetailBlockBase from '../components/DetailBlockBase'
import { getAnnotatedSelectedDataTree } from '../selectors'

const mapStateToProps = state => {
  return {
    selectionStartTime: state.selected.start,
    selectionEndTime: state.selected.end,
    selectedSource: state.selected.source,
    selectedData: state.selected.data,
    selectedAnnotations: state.selected.annotations
  }
}

const mapDispatchToProps = dispatch => {
  return {}
}

const DetailBlock = connect(
  mapStateToProps,
  mapDispatchToProps
)(DetailBlockBase)

window.getAnnotatedSelectedDataTree = getAnnotatedSelectedDataTree;

export default DetailBlock
