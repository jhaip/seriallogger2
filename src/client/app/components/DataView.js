import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import moment from 'moment'
import 'react-widgets/dist/css/react-widgets.css'
import DropdownList from 'react-widgets/lib/DropdownList'
import Multiselect from 'react-widgets/lib/Multiselect'
import RangeSelection from "./RangeSelection"

const mapStateToProps = state => {
  return {}
}

const mapDispatchToProps = dispatch => {
  return {}
}

class DataView extends React.Component {
  render() {
    const source_dropdown_styles = {
      width: "150px",
      display: "inline-block",
      marginLeft: "5px",
      marginRight: "5px"
    }
    let colors = ['orange', 'red', 'blue', 'purple'];
    return (
      <div>
        <div>
          <DropdownList
            data={["raw", "line graph"]}
            value={this.props.visualType}
            onChange={this.todo}
            style={source_dropdown_styles}
          />
          <input
            type="submit"
            id="copy-selected-view-embed-button"
            data-clipboard-text={this.props.selected_view_embed_code}
            value="Copy Embed Code"
            readOnly
          />
        </div>
        <div style={{padding: "10px 0px"}}>
          <RangeSelection
            startTime={moment.utc(this.props.start).toDate()}
            endTime={moment.utc(this.props.end).toDate()}
            onChange={this.todo} />
        </div>
        <div>
          <Multiselect
            data={this.props.sourceNames}
            defaultValue={this.props.sourceNames}
          />
        </div>
      </div>
    );
  }
}
DataView.propTypes = {
  sourceNames: PropTypes.array.isRequired,
  start: PropTypes.string.isRequired,
  end: PropTypes.string.isRequired,
  visualType: PropTypes.string.isRequired
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(DataView)
