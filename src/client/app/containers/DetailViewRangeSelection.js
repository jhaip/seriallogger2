import { connect } from 'react-redux'
import { changeSelectionRange } from '../actions/DetailActions'
import RangeSelection from '../components/RangeSelection'

const mapStateToProps = state => {
  return {
    startTime: state.selected.start,
    endTime: state.selected.end
  }
}

const mapDispatchToProps = dispatch => {
  return {
    onChange: (start, end) => {
      dispatch(changeSelectionRange(start, end))
    }
  }
}

const DetailViewRangeSelection = connect(
  mapStateToProps,
  mapDispatchToProps
)(RangeSelection)

export default DetailViewRangeSelection
