import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import moment from 'moment'
import 'react-widgets/dist/css/react-widgets.css'
import DropdownList from 'react-widgets/lib/DropdownList'
import Multiselect from 'react-widgets/lib/Multiselect'
import RangeSelection from "./RangeSelection"
import AnnotationView from "./AnnotationView"
import DetailViewText from "./DetailViewText"
import DetailViewLineGraph from "../containers/DetailViewLineGraph"
import {
  getDataViewData,
  getAnnotatedDataTree
} from '../selectors'
import {
  changeDataViewVisualType,
  changeDataViewStart,
  changeDataViewEnd,
  changeDataViewSourceNames
} from '../actions/DataViewActions'

const mapStateToProps = (state, ownProps) => {
  return {
    data: getDataViewData(
      state,
      ownProps.start,
      ownProps.end,
      ownProps.sourceNames
    ),
    dataForTextBad: getAnnotatedDataTree(
      state,
      ownProps.start,
      ownProps.end,
      ownProps.sourceNames
    ),
  }
}

const mapDispatchToProps = dispatch => {
  return {
    changeDataViewVisualType,
    changeDataViewStart,
    changeDataViewEnd,
    changeDataViewSourceNames
  }
}

class DataView extends React.Component {
  renderVisual() {
    switch (this.props.selectedVisualType) {
      case "line graph":
        return (
          <DetailViewLineGraph
            data={this.props.data}
            activeAnnotation={this.props.activeAnnotation} />
        );
        break;
      case "raw":
      default:
        return (
          <DetailViewText data={this.props.dataForTextBad}
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
    let colors = ['orange', 'red', 'blue', 'purple'];
    return (
      <div>
        <div>
          <div style={{padding: "10px 0px", display: "inline-block"}}>
            <DropdownList
              data={["raw", "line graph"]}
              value={this.props.visualType}
              onChange={this.todo}
              style={source_dropdown_styles}
            />
          </div>
          <div style={{padding: "10px 0px", display: "inline-block"}}>
            <RangeSelection
              startTime={moment.utc(this.props.start).toDate()}
              endTime={moment.utc(this.props.end).toDate()}
              onChange={this.todo} />
          </div>
          <div style={{padding: "10px 0px", display: "inline-block"}}>
            <input
              type="submit"
              id="copy-selected-view-embed-button"
              data-clipboard-text={this.props.selected_view_embed_code}
              value="Copy"
              readOnly
            />
          </div>
          <div>
            <Multiselect
              data={this.props.sourceNames}
              defaultValue={this.props.sourceNames}
            />
          </div>
        </div>
        <div className="selected-view__data-container">
          { this.renderVisual() }
        </div>
      </div>
    );
  }
}
DataView.propTypes = {
  sourceNames: PropTypes.array.isRequired,
  start: PropTypes.instanceOf(Date).isRequired,
  end: PropTypes.instanceOf(Date).isRequired,
  visualType: PropTypes.string.isRequired,
  data: PropTypes.array.isRequired,
  id: PropTypes.string.isRequired
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(DataView)
