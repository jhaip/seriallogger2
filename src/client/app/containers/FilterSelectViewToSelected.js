import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { getSelectionDetails } from '../utils/selection'
import moment from 'moment'

const mapDispatchToProps = dispatch => {
  return {
    onClick: () => {
      var selection_details = getSelectionDetails();
      // add 1s hacks to deal with an API(?) issue fetching the exact date
      var start_date = moment.utc(selection_details.start.data_timestamp).subtract(1, 's').toDate();
      var end_date = moment.utc(selection_details.end.data_timestamp).add(1, 's').toDate();
      console.log(start_date);
      // TODO: dispatch a new function to change the selection range on the
      //       current Data View
      // dispatch(changeSelectionRange(start_date, end_date));
    }
  }
}

class FilterSelectViewToSelected extends React.Component {
  render() {
    return (
      <div>
        <input type="submit"
               value="Narrow to Selected"
               className="selected-view__narrow-to-selected"
               onClick={this.props.onClick} />
      </div>
    );
  }
}
FilterSelectViewToSelected.propTypes = {
  onClick: PropTypes.func.isRequired
};

export default connect(
  null,
  mapDispatchToProps
)(FilterSelectViewToSelected)
