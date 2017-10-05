import { connect } from 'react-redux'
import { changeSelectionRange } from '../actions/DetailActions'
import LabeledTimelineList from '../components/LabeledTimelineList'
import moment from 'moment'
import { getDataWithDerivativeSources } from '../selectors'

const mapStateToProps = state => {
  return {
    viewStartTime: state.view.start,
    viewEndTime: state.view.end,
    viewLabels: state.view.sources.map(s => s.name).concat(state.view.derivativeSources.map(ds => ds.name)),
    selectionStartTime: state.selected.start,
    selectionEndTime: state.selected.end,
    data: getDataWithDerivativeSources(state)
  }
}

const mapDispatchToProps = dispatch => {
  return {
    onDomainChange: (newDomain) => {
      console.log("onDomainChange");
      console.log(newDomain);
      dispatch(changeSelectionRange(moment(newDomain.x[0]).toDate(),
                                    moment(newDomain.x[1]).toDate()));
    }
  }
}

const SourcesOverview = connect(
  mapStateToProps,
  mapDispatchToProps
)(LabeledTimelineList)

export default SourcesOverview
