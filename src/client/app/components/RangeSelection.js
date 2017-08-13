import React from 'react'
import PropTypes from 'prop-types'
import moment from 'moment'
import momentLocalizer from 'react-widgets/lib/localizers/moment'
import DateTimePicker from 'react-widgets/lib/DateTimePicker'

momentLocalizer(moment);

class RangeSelection extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      value0: this.props.startTime,
      value1: this.props.endTime
    }
    console.log(this.state);
    this.onStartTimeChange = this.onStartTimeChange.bind(this);
    this.onEndTimeChange = this.onEndTimeChange.bind(this);
  }

  onStartTimeChange(date) {
    this.setState({value0: date});
    this.props.onChange(date, this.state.value1);
  }

  onEndTimeChange(date) {
    this.setState({value1: date});
    this.props.onChange(this.state.value0, date);
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      value0: nextProps.startTime,
      value1: nextProps.endTime
    });
  }

  render() {
    const date_time_styles = {
      maxWidth: "300px",
      display: "inline-block",
      marginLeft: "5px",
      marginRight: "5px"
    }
    return (
      <div>
        <div>
          Showing
          <DateTimePicker
            value={this.state.value0}
            onChange={this.onStartTimeChange}
            style={date_time_styles}
          />
          to
          <DateTimePicker
            value={this.state.value1}
            onChange={this.onEndTimeChange}
            style={date_time_styles}
          />
        </div>
      </div>
    );
  }
}
RangeSelection.propTypes = {
  startTime: PropTypes.instanceOf(Date).isRequired,
  endTime: PropTypes.instanceOf(Date).isRequired,
  onChange: PropTypes.func.isRequired,
};

export default RangeSelection
