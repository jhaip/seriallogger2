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
      ownProps.stop,
      ownProps.sourceNames
    ),
    dataForTextBad: getAnnotatedDataTree(
      state,
      ownProps.start,
      ownProps.stop,
      ownProps.sourceNames
    ),
    availableSourceNames: Object.keys(state.data)
  }
}

const mapDispatchToProps = dispatch => {
  return {
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

class DerivativeView extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      input: `return sourceData.view.map(function(d) {
  return {
    "timestamp": d.timestamp,
    "value": JSON.parse(d.value).page
  };
});`,
      output: '',
      error: '',
      sourceName: '',
      derivativeSourceBase: 'Blank'
    };
    this.renderVisual = this.renderVisual.bind(this);
    this.onTimeChange = this.onTimeChange.bind(this);
  }
  renderVisual() {
    return (
      <div>
        <div>
          <textarea
            style={{'width': '630px', 'height': '100px'}}
            value={this.state.input}
            onChange={this.onChangeInput} />
        </div>
        <div>
          <pre style={{'width': '630px', 'height': '200px', 'border': '1px solid #CCC'}}>
            { this.state.output }
          </pre>
        </div>
        <div />
        {
          this.state.error &&
          <p style={{color: 'red'}}>{ this.state.error }</p>
        }
      </div>
    );
  }
  onTimeChange(start, end) {
    this.props.changeDataViewStart(this.props.id, start);
    this.props.changeDataViewEnd(this.props.id, end);
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
              data={["derivative source 1", "derivative source 2"]}
              value={"derivative source 1"}
              style={source_dropdown_styles}
            />
          </div>
          <div style={{padding: "10px 0px", display: "inline-block"}}>
            <RangeSelection
              startTime={moment.utc(this.props.start).toDate()}
              endTime={moment.utc(this.props.stop).toDate()}
              onChange={this.onTimeChange} />
          </div>
          <div>
            Dependencies:
            <Multiselect
              value={this.props.sourceNames}
              data={this.props.availableSourceNames}
              onChange={(v) => this.props.changeDataViewSourceNames(this.props.id, v)}
            />
          </div>
        </div>
        <div>
          <div>return a derivative source given variable "sourceData".</div>
        </div>
        <div className="selected-view__data-container">
          { this.renderVisual() }
        </div>
      </div>
    );
  }
}
DerivativeView.propTypes = {
  availableSourceNames: PropTypes.array.isRequired,
  sourceNames: PropTypes.array.isRequired,
  start: PropTypes.instanceOf(Date).isRequired,
  stop: PropTypes.instanceOf(Date).isRequired,
  visualType: PropTypes.string.isRequired,
  data: PropTypes.array.isRequired,
  id: PropTypes.string.isRequired
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(DerivativeView)
