import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import 'react-widgets/dist/css/react-widgets.css'
import DropdownList from 'react-widgets/lib/DropdownList'
import Multiselect from 'react-widgets/lib/Multiselect'
import DetailViewRangeSelection from "../containers/DetailViewRangeSelection"

const mapStateToProps = state => {
  return {}
}

const mapDispatchToProps = dispatch => {
  return {}
}

class NewDataOverviewPage extends React.Component {
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
            data={this.props.availableSources}
            value={this.props.selectedSource}
            onChange={this.props.onSelectedSourceChange}
            style={source_dropdown_styles}
          />
          <DropdownList
            data={["raw", "line graph"]}
            value={this.props.selectedVisualType}
            onChange={this.props.onSelectedVisualTypeChange}
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
          <DetailViewRangeSelection />
        </div>
        <div>
          <Multiselect
            data={colors}
            defaultValue={["orange", "blue"]}
          />
        </div>
      </div>
    );
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(NewDataOverviewPage)
