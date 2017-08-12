import { connect } from 'react-redux'
import FilterSelectViewToSelectedBase from '../components/FilterSelectViewToSelectedBase'
import { getSelectionDetails } from '../utils/selection'
import { changeSelectionRange } from '../actions/DetailActions'
import moment from 'moment'

const mapStateToProps = state => {
  return {}
}

const mapDispatchToProps = dispatch => {
  return {
    onClick: () => {
      var selection_details = getSelectionDetails();
      // add 1s hacks to deal with an API(?) issue fetching the exact date
      var start_date = moment.utc(selection_details.start.data_timestamp).subtract(1, 's').toDate();
      var end_date = moment.utc(selection_details.end.data_timestamp).add(1, 's').toDate();
      console.log(start_date);
      dispatch(changeSelectionRange(start_date, end_date));
    }
  }
}

const FilterSelectViewToSelected = connect(
  mapStateToProps,
  mapDispatchToProps
)(FilterSelectViewToSelectedBase)

export default FilterSelectViewToSelected
