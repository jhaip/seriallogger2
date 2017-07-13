import { connect } from 'react-redux'
import DetailBlockBase from '../components/DetailBlockBase'

const mapStateToProps = state => {
  return {
    selectionStartTime: state.selected.start,
    selectionEndTime: state.selected.end,
    selectedSources: state.selected.sources
  }
}

const mapDispatchToProps = dispatch => {
  return {}
}

const DetailBlock = connect(
  mapStateToProps,
  mapDispatchToProps
)(DetailBlockBase)

export default DetailBlock
