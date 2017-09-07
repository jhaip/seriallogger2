import React from 'react'
import PropTypes from 'prop-types'
import moment from 'moment'
import DetailViewText from "./DetailViewText"
import DetailViewLineGraph from "../containers/DetailViewLineGraph"
import AnnotationView from "./AnnotationView"
import DetailViewRangeSelection from "../containers/DetailViewRangeSelection"
import DropdownList from 'react-widgets/lib/DropdownList'
import Clipboard from 'clipboard'

class DetailBlockBase extends React.Component {
  componentDidMount() {
    var clipboard = new Clipboard('#copy-selected-view-embed-button');
  }
  renderVisual() {
    switch (this.props.selectedVisualType) {
      case "line graph":
        return (
          <DetailViewLineGraph
            data={this.props.selectedData}
            activeAnnotation={this.props.activeAnnotation} />
        );
        break;
      case "raw":
      default:
        return (
          <DetailViewText data={this.props.selectedData}
                          activeAnnotation={this.props.activeAnnotation} />
        );
    }
  }
  render() {
    const source_dropdown_styles = {
      width: "150px",
      display: "inline-block",
      marginLeft: "5px",
      marginRight: "5px"
    }
    return (
      <div className="c-detail-block-base">
        <div>
          <strong>Selected View:</strong>
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
        <div className="selected-view__data-container">
          { this.renderVisual() }
          <div className="selected-view__data-annotations-col">
            <AnnotationView />
          </div>
        </div>
      </div>
    );
  }
}
DetailBlockBase.propTypes = {
  selectionStartTime: PropTypes.instanceOf(Date).isRequired,
  selectionEndTime: PropTypes.instanceOf(Date).isRequired,
  selectedSource: PropTypes.string.isRequired,
  selectedData: PropTypes.array.isRequired,
  selectedAnnotations: PropTypes.array.isRequired,
  activeAnnotation: PropTypes.string.isRequired,
  availableSources: PropTypes.array.isRequired,
  onSelectedSourceChange: PropTypes.func.isRequired,
  selected_view_embed_code: PropTypes.string.isRequired,
  selectedVisualType: PropTypes.string.isRequired,
  onSelectedVisualTypeChange: PropTypes.func.isRequired
};

export default DetailBlockBase
