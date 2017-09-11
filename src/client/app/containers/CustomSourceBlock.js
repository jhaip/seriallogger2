import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import {
  addDerivativeDataSource,
  computeDerivativeSource
} from '../actions/OverviewActions'

const mapStateToProps = state => {
  return {
    sourceData: state.view.data
  }
}

const mapDispatchToProps = dispatch => {
  return {
    addDerivativeDataSource: (sourceName, derivativeFunc) => {
      dispatch(addDerivativeDataSource(sourceName, derivativeFunc));
    }
  }
}

class CustomSourceBlock extends React.Component {
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
      sourceName: ''
    };
    this.getSampleOutput = this.getSampleOutput.bind(this);
    this.onChangeInput = this.onChangeInput.bind(this);
    this.save = this.save.bind(this);
    this.delete = this.delete.bind(this);
    this.createSource = this.createSource.bind(this);
    this.handleSourceNameChange = this.handleSourceNameChange.bind(this);
  }
  onChangeInput(e) {
    e.preventDefault();
    this.setState({input: e.target.value});
  }
  save(e) {
    e.preventDefault();
    const name = prompt("Enter your derivative source's name");
    if (name !== null) {
      console.log(`TODO: save with name ${name}`);
    }
  }
  delete(e) {
    e.preventDefault();
    if (confirm("Are you sure you want to delete this derivative source?")) {
      console.log("TODO: delete");
    }
  }
  createSource(e) {
    e.preventDefault();
    this.props.addDerivativeDataSource(this.state.sourceName, this.state.input);
  }
  handleSourceNameChange(e) {
    e.preventDefault();
    this.setState({sourceName: e.target.value});
  }
  getSampleOutput() {
    // const funcBody = `
    // var cleanData = sourceData.serial.reduce((acc, d) => {
    //   var re = / (\d\d.\d\d)\*F/g;
    //   var s = d.value.slice(0);
    //   var m;
    //   var matches = [];
    //   do {
    //       m = re.exec(s);
    //       if (m) {
    //         matches.push({"timestamp": d.timestamp, "value": +m[1]});
    //       }
    //   } while (m);
    //
    //   return acc.concat(matches);
    // }, []);
    // return cleanData;
    // `;
    const funcBody = this.state.input;
    const sourceData = this.props.sourceData;
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
  render() {
    return (
      <div className="custom-source-block">
        <div><strong>Set up a derivative source</strong></div>
        <div>return a derivative source given variable "sourceData".</div>
        <textarea
          className="custom-source-block__col"
          value={this.state.input}
          onChange={this.onChangeInput} />
        <pre className="custom-source-block__col">
          { this.state.output }
        </pre>
        <div style={{clear: 'both'}} />
        {
          this.state.error &&
          <p style={{color: 'red'}}>{ this.state.error }</p>
        }
        <div>
          <button onClick={ this.getSampleOutput }>Run</button>
          <button onClick={ this.save }>Save</button>
          <button onClick={ this.delete }>Delete</button>
        </div>
        <div>
          <input
            type="text"
            value={this.state.sourceName}
            placeholder="New source name"
            onChange={this.handleSourceNameChange} />
          <button onClick={ this.createSource }>Add source to Overview</button>
        </div>
      </div>
    );
  }
}
CustomSourceBlock.propTypes = {
  sourceData: PropTypes.obj,
  addDerivativeDataSource: PropTypes.func.isRequired
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CustomSourceBlock)
