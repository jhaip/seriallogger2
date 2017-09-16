import { connect } from 'react-redux'
import { changeSelectionRange } from '../actions/DetailActions'
import LabeledTimelineList from '../components/LabeledTimelineList'
import moment from 'moment'

const mapStateToProps = state => {
  return {
    viewStartTime: state.view.start,
    viewEndTime: state.view.end,
    viewLabels: state.view.sources.concat(state.view.derivativeSources.sources),
    selectionStartTime: state.selected.start,
    selectionEndTime: state.selected.end,
    data: Object.assign({}, state.view.data, state.view.derivativeSources.data)
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
