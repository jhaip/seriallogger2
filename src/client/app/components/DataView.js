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
import DataViewHTML from './DataViews/HTML/DataViewHTML'
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
      'embedCode': this.getEmbedCode(props),
      'autoRefresh': false,
      'timerIconFlipFlop': false
    };
    this.renderVisual = this.renderVisual.bind(this);
    this.onTimeChange = this.onTimeChange.bind(this);
    this.fetchDataForAllSources = this.fetchDataForAllSources.bind(this);
    this.onAutoRefreshClicked = this.onAutoRefreshClicked.bind(this);
    this.flipTimerIcon = this.flipTimerIcon.bind(this);
    this.getEmbedCode = this.getEmbedCode.bind(this);
    this.timer = null;
    this.autoRefreshDelayMs = 4000;
  }
  getEmbedCode(props) {
    return `<Embed source="${props.sourceNames.join(", ")}" ` +
      `start="${getUtcDateString(props.start)}" ` +
      `end="${getUtcDateString(props.stop)}" ` +
      `visualType="${props.visualType}"` +
      `></Embed>`;
  }
  fetchDataForAllSources(nextProps) {
    nextProps.sourceNames.forEach(sourceName => {
      nextProps.fetchData(sourceName, nextProps.start, nextProps.stop);
    });
    this.setState({
      embedCode: this.getEmbedCode(nextProps)
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
    var clipboard = new Clipboard('#copy-selected-view-embed-button');
  }
  renderVisual() {
    switch (this.props.visualType) {
      case "html":
        return (
          <DataViewHTML
            data={this.props.data}
            activeAnnotation={this.props.activeAnnotation}
          />
        );
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
  flipTimerIcon() {
    this.setState({
      timerIconFlipFlop: !this.state.timerIconFlipFlop
    });
  }
  onAutoRefreshClicked(e) {
    const newAutoRefreshSetting = !this.state.autoRefresh;
    this.setState({
      autoRefresh: newAutoRefreshSetting
    });
    if (newAutoRefreshSetting) {
      this.props.changeDataViewEnd(this.props.id, moment.utc().toDate());
      this.timer = setInterval(() => {
        console.log("TIMER!");
        this.props.changeDataViewEnd(this.props.id, moment.utc().toDate());
        this.flipTimerIcon();
      }, this.autoRefreshDelayMs);
    } else {
      clearInterval(this.timer);
    }
  }
  render() {
    return (
      <div style={{display: "grid", height: "90vh", gridTemplateRows: "auto 1fr"}}>
        <div>
          <div style={{display: "flex"}}>
            <div style={{paddingRight: "4px", flexGrow: "1"}}>
              <Multiselect
                value={this.props.sourceNames}
                data={this.props.availableSourceNames}
                placeholder="Choose Data Sources to show"
                onChange={(v) => this.props.changeDataViewSourceNames(this.props.id, v)}
              />
            </div>
            <div>
              <RangeSelection
                startTime={moment.utc(this.props.start).toDate()}
                endTime={moment.utc(this.props.stop).toDate()}
                onChange={this.onTimeChange} />
            </div>
            <div style={{padding: "0 4px", width: "100px"}}>
              <DropdownList
                data={["raw", "line graph", "html"]}
                value={this.props.visualType}
                onChange={(v) => this.props.changeDataViewVisualType(this.props.id, v)}
              />
            </div>
            <div style={{paddingLeft: "4px"}}>
              <button
                type="button"
                className="btn btn-default"
                id="copy-selected-view-embed-button"
                data-clipboard-text={this.state.embedCode}
              >
                &nbsp;
                <span className="glyphicon glyphicon-copy"></span>
                &nbsp;
              </button>
            </div>
            <div style={{paddingLeft: "4px"}}>
              <button
                type="button"
                className={ this.state.autoRefresh
                  ? "btn btn-primary"
                  : "btn btn-default"
                }
                onClick={ this.onAutoRefreshClicked }
              >
                &nbsp;
                <span
                  className={ this.state.timerIconFlipFlop
                    ? "glyphicon glyphicon-refresh"
                    : "glyphicon glyphicon-repeat"
                  }
                ></span>
                &nbsp;
              </button>
            </div>
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
