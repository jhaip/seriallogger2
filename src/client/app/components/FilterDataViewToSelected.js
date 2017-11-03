import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { getSelectionDetails } from '../utils/selection'
import moment from 'moment'
import {
  changeDataViewStart,
  changeDataViewEnd
} from '../actions/DataViewActions'

const mapDispatchToProps = dispatch => {
  return {
    onClick: (dataViewId) => {
      var selection_details = getSelectionDetails();
      // add 1s hacks to deal with an API(?) issue fetching the exact date
      var start_date = moment.utc(selection_details.start.data_timestamp).subtract(1, 's').toDate();
      var end_date = moment.utc(selection_details.end.data_timestamp).add(1, 's').toDate();
      console.log(start_date);
      // TODO: fix timezone bug
      dispatch(changeDataViewStart(dataViewId, start_date));
      dispatch(changeDataViewEnd(dataViewId, end_date));
    }
  }
}

class FilterDataViewToSelected extends React.Component {
  render() {
    return (
      <div>
        <input
          type="submit"
          value="Narrow to Selected"
          className="selected-view__narrow-to-selected"
          onClick={() => this.props.onClick(this.props.dataViewId)}
        />
      </div>
    );
  }
}
FilterDataViewToSelected.propTypes = {
  onClick: PropTypes.func.isRequired,
  dataViewId: PropTypes.string.isRequired
};

export default connect(
  null,
  mapDispatchToProps
)(FilterDataViewToSelected)
