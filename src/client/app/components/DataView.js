import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { getUtcDateString } from '../utils/time'
import moment from 'moment'
import 'react-widgets/dist/css/react-widgets.css'
import DropdownList from 'react-widgets/lib/DropdownList'
import Multiselect from 'react-widgets/lib/Multiselect'
import RangeSelection from "./RangeSelection"
import AnnotationView from "./Annotations/AnnotationView"
import FilterDataViewToSelected from "./FilterDataViewToSelected"
import DataViewText from "./DataViews/Text/DataViewText"
import DataViewLineGraph from "./DataViews/LineGraph/DataViewLineGraph"
import {
  getDataViewData,
  getAnnotatedDataTree,
  getDataViewDataAnnotations,
  getDataViewActiveAnnotation
} from '../selectors'
import {
  changeDataViewVisualType,
  changeDataViewStart,
  changeDataViewEnd,
  changeDataViewSourceNames
} from '../actions/DataViewActions'
import { fetchData } from '../actions/DataActions'
import Clipboard from 'clipboard'

const mapStateToProps = (state, props) => {
  return {
    data: getDataViewData(
      state,
      props.start,
      props.stop,
      props.sourceNames
    ),
    dataForTextBad: getAnnotatedDataTree(
      state,
      props.start,
      props.stop,
      props.sourceNames,
      props.id
    ),
    availableSourceNames: Object.keys(state.data),
    activeAnnotation: getDataViewActiveAnnotation(state, props.id)
  }
}

const mapDispatchToProps = dispatch => {
  return {
    fetchData: (source, start, end) => {
      dispatch(fetchData(source, start, end))
    },
    changeDataViewVisualType: (dataViewId, visualType) => {
      dispatch(changeDataViewVisualType(dataViewId, visualType))
    },
    changeDataViewStart: (dataViewId, start) => {
      dispatch(changeDataViewStart(dataViewId, start))
    },
    changeDataViewEnd: (dataViewId, end) => {
      dispatch(changeDataViewEnd(dataViewId, end))
    },
    changeDataViewSourceNames: (dataViewId, sourceNames) => {
      dispatch(changeDataViewSourceNames(dataViewId, sourceNames))
    }
  }
}

class DataView extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      'embedCode': `<Embed source="${props.sourceNames.join(", ")}" ` +
        `start="${getUtcDateString(props.start)}" ` +
        `end="${getUtcDateString(props.stop)}" ` +
        `visualType="${props.visualType}"` +
        `></Embed>`
    };
    this.renderVisual = this.renderVisual.bind(this);
    this.onTimeChange = this.onTimeChange.bind(this);
    this.fetchDataForAllSources = this.fetchDataForAllSources.bind(this);
  }
  fetchDataForAllSources(nextProps) {
    nextProps.sourceNames.forEach(sourceName => {
      nextProps.fetchData(sourceName, nextProps.start, nextProps.stop);
    });
  }
  componentWillReceiveProps(nextProps) {
    if (this.props.availableSourceNames.length === 0) {
      if (nextProps.availableSourceNames.length > 0) {
        console.log("GOT AVAILABLE SOURCES, FETCHING SOURCE NAMES FOR DATA VIEW");
        this.fetchDataForAllSources(nextProps);
      }
    } else if (this.props.availableSourceNames.length > 0) {
      if (this.props.sourceNames !== nextProps.sourceNames ||
          this.props.start !== nextProps.start ||
          this.props.stop !== nextProps.stop) {
        console.log("VIEW CHANGED, FETCHING SOURCE NAMES FOR DATA VIEW");
        this.fetchDataForAllSources(nextProps);
      }
    }
  }
  componentDidMount() {
    var clipboard = new Clipboard('#-selected-view-embed-button');
  }
  renderVisual() {
    switch (this.props.visualType) {
      case "line graph":
        return (
          <DataViewLineGraph
            data={this.props.data}
            activeAnnotation={this.props.activeAnnotation}
          />
        );
      case "raw":
      default:
        return (
          <DataViewText
            data={this.props.dataForTextBad}
            activeAnnotation={this.props.activeAnnotation}
          />
        );
    }
  }
  onTimeChange(start, end) {
    this.props.changeDataViewStart(this.props.id, start);
    this.props.changeDataViewEnd(this.props.id, end);
  }
  render() {
    const source_dropdown_styles = {
      width: "120px",
      display: "inline-block",
      marginLeft: "5px",
      marginRight: "5px"
    }
    let colors = ['orange', 'red', 'blue', 'purple'];
    return (
      <div>
        <div style={{display: "flex"}}>
          <div style={{paddingRight: "4px", width: "150px"}}>
            <DropdownList
              data={["raw", "line graph"]}
              value={this.props.visualType}
              onChange={(v) => this.props.changeDataViewVisualType(this.props.id, v)}
            />
          </div>
          <div style={{padding: "0px 4px"}}>
            <RangeSelection
              startTime={moment.utc(this.props.start).toDate()}
              endTime={moment.utc(this.props.stop).toDate()}
              onChange={this.onTimeChange} />
          </div>
          <div style={{padding: "0px 4px"}}>
            <input
              type="submit"
              className="btn btn-default"
              id="copy-selected-view-embed-button"
              data-clipboard-text={this.state.embedCode}
              value="Copy"
              readOnly
            />
          </div>
          <div style={{padding: "0px 4px"}}>
            <FilterDataViewToSelected dataViewId={this.props.id} />
          </div>
        </div>
        <div style={{display: "flex", marginTop: "10px"}}>
          <div style={{width: "632px"}}>
            <Multiselect
              value={this.props.sourceNames}
              data={this.props.availableSourceNames}
              placeholder="Choose Data Sources to show"
              onChange={(v) => this.props.changeDataViewSourceNames(this.props.id, v)}
            />
          </div>
        </div>
        <div className="selected-view__data-container" style={{marginTop: "10px"}}>
          { this.renderVisual() }
          <div className="selected-view__data-annotations-col">
            <AnnotationView dataViewId={this.props.id} />
          </div>
        </div>
      </div>
    );
  }
}
DataView.propTypes = {
  availableSourceNames: PropTypes.array.isRequired,
  sourceNames: PropTypes.array.isRequired,
  start: PropTypes.instanceOf(Date).isRequired,
  stop: PropTypes.instanceOf(Date).isRequired,
  visualType: PropTypes.string.isRequired,
  data: PropTypes.array.isRequired,
  id: PropTypes.string.isRequired,
  fetchData: PropTypes.func.isRequired,
  activeAnnotation: PropTypes.string.isRequired
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(DataView)
