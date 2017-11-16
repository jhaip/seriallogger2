import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import moment from 'moment'
import 'react-widgets/dist/css/react-widgets.css'
import DropdownList from 'react-widgets/lib/DropdownList'
import Multiselect from 'react-widgets/lib/Multiselect'
import RangeSelection from "./RangeSelection"
import AnnotationView from "./Annotations/AnnotationView"
import DataViewText from "./DataViews/Text/DataViewText"
import DataViewLineGraph from "./DataViews/LineGraph/DataViewLineGraph"
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
import {
  computeDerivativeSource,
  fetchDerivativeSourceDefinitions,
  saveDerivativeSourceDefinition,
  deleteDerivativeSourceDefinition
} from '../actions/DerivativeSourceActions'
import {
  createDerivativeDataSource
} from '../actions/DataSourceActions'
import { fetchData } from '../actions/DataActions'

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
      ownProps.sourceNames,
      ownProps.id
    ),
    availableSourceNames: Object.keys(state.data),
    derivativeSourceDefinitions: state.derivativeSourceDefinitions
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
    },
    addDerivativeDataSource: (sourceName, derivativeFunc, sourceDependencies) => {
      dispatch(createDerivativeDataSource(sourceName, derivativeFunc, sourceDependencies));
    },
    fetchDerivativeSourceDefinitions: () => {
      dispatch(fetchDerivativeSourceDefinitions());
    },
    saveDerivativeSourceDefinition: (name, sourceCode) => {
      dispatch(saveDerivativeSourceDefinition(name, sourceCode));
    },
    deleteDerivativeSourceDefinition: (name) => {
      dispatch(deleteDerivativeSourceDefinition(name));
    }
  }
}

class DerivativeView extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      input: `return sourceData.map(function(d) {
  return {
    "timestamp": d.timestamp,
    "value": JSON.parse(d.value)
  };
});`,
      output: '',
      error: '',
      sourceName: '',
      derivativeSourceBase: 'Blank'
    };
    this.onTimeChange = this.onTimeChange.bind(this);
    this.getSampleOutput = this.getSampleOutput.bind(this);
    this.onChangeInput = this.onChangeInput.bind(this);
    this.save = this.save.bind(this);
    this.delete = this.delete.bind(this);
    this.createSource = this.createSource.bind(this);
    this.handleSourceNameChange = this.handleSourceNameChange.bind(this);
    this.onDerivativeSourceBaseChange = this.onDerivativeSourceBaseChange.bind(this);
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
  componentWillMount() {
    this.props.fetchDerivativeSourceDefinitions();
  }
  onChangeInput(e) {
    e.preventDefault();
    this.setState({input: e.target.value});
  }
  save(e) {
    e.preventDefault();
    const name = prompt("Enter your derivative source's name");
    if (name !== null) {
      this.props.saveDerivativeSourceDefinition(name, this.state.input);
    }
  }
  delete(e) {
    e.preventDefault();
    if (confirm("Are you sure you want to delete this derivative source?")) {
      this.props.deleteDerivativeSourceDefinition(this.state.derivativeSourceBase);
    }
  }
  getSampleOutput() {
    const funcBody = this.state.input;
    const sourceData = this.props.data;
    let result = null;
    try {
      result = computeDerivativeSource(sourceData, funcBody);
      this.setState({error: ''});
    } catch (e) {
        if (e instanceof SyntaxError) {
            this.setState({error: `Syntax Error: ${e.message}`});
        } else {
            this.setState({error: e.message});
        }
    }
    this.setState({output: result.map(l => JSON.stringify(l)).join("\n---\n")});
  }
  onDerivativeSourceBaseChange(source) {
    const newInput = this.props.derivativeSourceDefinitions[source] || "";
    this.setState({
      derivativeSourceBase: source,
      input: newInput,
      output: ''
    });
  }
  createSource(e) {
    e.preventDefault();
    this.props.addDerivativeDataSource(this.state.sourceName,
                                       this.state.input,
                                       this.props.sourceNames);
  }
  handleSourceNameChange(e) {
    e.preventDefault();
    this.setState({sourceName: e.target.value});
  }
  onTimeChange(start, end) {
    this.props.changeDataViewStart(this.props.id, start);
    this.props.changeDataViewEnd(this.props.id, end);
  }
  render() {
    return (
      <div style={{display: "grid", height: "90vh", gridTemplateRows: "auto 1fr"}}>
        <div>
          <div style={{display: "flex"}}>
            <div style={{width: "150px", paddingRight: "4px"}}>
              <DropdownList
                data={["Blank"].concat(Object.keys(this.props.derivativeSourceDefinitions))}
                value={this.state.derivativeSourceBase}
                onChange={this.onDerivativeSourceBaseChange}
              />
            </div>
            <div style={{padding: "0 4px", flexGrow: "1"}}>
              <Multiselect
                value={this.props.sourceNames}
                data={this.props.availableSourceNames}
                placeholder="Dependencies"
                onChange={(v) => this.props.changeDataViewSourceNames(this.props.id, v)}
              />
            </div>
            <div>
              <RangeSelection
                startTime={moment.utc(this.props.start).toDate()}
                endTime={moment.utc(this.props.stop).toDate()}
                onChange={this.onTimeChange} />
            </div>
          </div>
        </div>
        <div className="selected-view__data-container">
          <div style={{flexGrow: 1, overflow: "scroll", display: "flex", width: '100%'}}>
            <div style={{overflow: "hidden", flexGrow: 1, position: "relative"}}>
              <div style={{position: "absolute", overflow: "scroll", top: 0, bottom: 0, left: 0, right: 0}}>
                <div style={{display: "flex", flexDirection: "column", height: "100%"}}>
                  <div style={{marginTop: "10px"}}>
                    <p className="text-muted">
                      Return a derivative source given variable <code>sourceData</code>.
                    </p>
                  </div>
                  <div>
                    <textarea
                      className="form-control"
                      style={{'width': '100%', 'height': '200px', resize: "vertical"}}
                      value={this.state.input}
                      onChange={this.onChangeInput} />
                  </div>
                  <div>
                    <div style={{display: "flex", marginTop: "10px"}}>
                      <button
                        type="button"
                        className="btn btn-success"
                        onClick={ this.getSampleOutput }
                      >
                        Run
                      </button>
                      <button
                        type="button"
                        className="btn btn-default"
                        style={{margin: "0 4px"}}
                        onClick={ this.save }
                      >
                        Save Code
                      </button>
                      <button
                        type="button"
                        className="btn btn-danger"
                        onClick={ this.delete }
                      >
                        Delete
                      </button>
                      <input
                        type="text"
                        className="form-control"
                        value={this.state.sourceName}
                        placeholder="New source name"
                        style={{margin: "0 4px", maxWidth: "200px"}}
                        onChange={this.handleSourceNameChange}
                      />
                      <button
                        type="button"
                        className="btn btn-primary"
                        onClick={ this.createSource }
                      >
                        Create Source
                      </button>
                    </div>
                  </div>
                  <pre style={{'width': '100%', flexGrow: '1', 'border': '1px solid #CCC', marginTop: "10px"}}>
                    { this.state.output }
                  </pre>
                  <div />
                  {
                    this.state.error &&
                    <p style={{color: 'red'}}>{ this.state.error }</p>
                  }
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
DerivativeView.propTypes = {
  availableSourceNames: PropTypes.array.isRequired,
  derivativeSourceDefinitions: PropTypes.object.isRequired,
  sourceNames: PropTypes.array.isRequired,
  start: PropTypes.instanceOf(Date).isRequired,
  stop: PropTypes.instanceOf(Date).isRequired,
  visualType: PropTypes.string.isRequired,
  data: PropTypes.array.isRequired,
  id: PropTypes.string.isRequired,
  addDerivativeDataSource: PropTypes.func.isRequired,
  fetchDerivativeSourceDefinitions: PropTypes.func.isRequired,
  saveDerivativeSourceDefinition: PropTypes.func.isRequired,
  deleteDerivativeSourceDefinition: PropTypes.func.isRequired
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(DerivativeView)
