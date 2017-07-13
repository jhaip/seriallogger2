import { connect } from 'react-redux'
import { changeSelectionRange } from '../actions'
import RangeSelection from '../components/RangeSelection'

const mapStateToProps = state => {
  return {
    startTime: state.view.start,
    endTime: state.view.end
  }
}

const mapDispatchToProps = dispatch => {
  return {
    onChange: (start, end) => {
      dispatch(changeViewRange(start, end))
    }
  }
}

const ViewRangeSelection = connect(
  mapStateToProps,
  mapDispatchToProps
)(RangeSelection)

export default ViewRangeSelection
