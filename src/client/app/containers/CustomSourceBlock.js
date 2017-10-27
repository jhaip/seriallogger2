import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import DropdownList from 'react-widgets/lib/DropdownList'
import {
  addDerivativeDataSource,
  computeDerivativeSource,
  fetchDerivativeSourceDefinitions,
  saveDerivativeSourceDefinition,
  deleteDerivativeSourceDefinition
} from '../actions/DerivativeSourceActions'

const mapStateToProps = state => {
  return {
    sourceData: state.view.data,
    derivativeSourceDefinitions: state.derivativeSourceDefinitions
  }
}

const mapDispatchToProps = dispatch => {
  return {
    addDerivativeDataSource: (sourceName, derivativeFunc) => {
      dispatch(addDerivativeDataSource(sourceName, derivativeFunc));
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
      sourceName: '',
      derivativeSourceBase: 'Blank'

    };
    this.getSampleOutput = this.getSampleOutput.bind(this);
    this.onChangeInput = this.onChangeInput.bind(this);
    this.save = this.save.bind(this);
    this.delete = this.delete.bind(this);
    this.createSource = this.createSource.bind(this);
    this.handleSourceNameChange = this.handleSourceNameChange.bind(this);
    this.onDerivativeSourceBaseChange = this.onDerivativeSourceBaseChange.bind(this);

    props.fetchDerivativeSourceDefinitions();
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
    //         matches.push({"timestamp": d.timestamp, "value": m[1]});
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
    const source_dropdown_styles = {
      width: "150px",
      display: "inline-block",
      marginLeft: "5px",
      marginRight: "5px"
    }
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
        </div>
        <div>
          <DropdownList
            data={["Blank"].concat(Object.keys(this.props.derivativeSourceDefinitions))}
            value={this.state.derivativeSourceBase}
            onChange={this.onDerivativeSourceBaseChange}
            style={source_dropdown_styles}
          />
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
  sourceData: PropTypes.object,
  addDerivativeDataSource: PropTypes.func.isRequired
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CustomSourceBlock)
