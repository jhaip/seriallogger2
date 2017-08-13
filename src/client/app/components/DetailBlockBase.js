import React from 'react'
import PropTypes from 'prop-types'
import moment from 'moment'
import DetailViewText from "./DetailViewText"
import AnnotationView from "./AnnotationView"
import DetailViewRangeSelection from "../containers/DetailViewRangeSelection"
import DropdownList from 'react-widgets/lib/DropdownList'
import Clipboard from 'clipboard'

class DetailBlockBase extends React.Component {
   componentDidMount() {
    var clipboard = new Clipboard('#copy-selected-view-embed-button');
  }
  render() {
    console.log(this.props.selectedData);
    const source_dropdown_styles = {
      width: "150px",
      display: "inline-block",
      marginLeft: "5px",
      marginRight: "5px"
    }
    return (
      <div className="c-detail-block-base">
        <div><strong>Selected View:</strong>
          <DropdownList
            data={this.props.availableSources}
            value={this.props.selectedSource}
            onChange={this.props.onSelectedSourceChange}
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
          <div id="selected-view__data">
            <DetailViewText data={this.props.selectedData}
                            activeAnnotation={this.props.activeAnnotation} />
          </div>
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
  selected_view_embed_code: PropTypes.string.isRequired
};

export default DetailBlockBase
