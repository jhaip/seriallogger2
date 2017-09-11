import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

const mapStateToProps = state => {
  return {
    sourceData: state.view.data
  }
}

const mapDispatchToProps = dispatch => {
  return {
    saveView: () => {
      dispatch(saveView());
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
      error: ''
    };
    this.computeDerivativeSource = this.computeDerivativeSource.bind(this);
    this.onChangeInput = this.onChangeInput.bind(this);
  }
  onChangeInput(e) {
    e.preventDefault();
    this.setState({input: e.target.value});
  }
  computeDerivativeSource() {
    const sourceData = this.props.sourceData;
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
    const func = `(function (sourceData) { ${funcBody} })(sourceData)`;
    console.log(func);
    let result = null;
    try {
      result = eval(func);
      this.setState({error: ''});
    } catch (e) {
        if (e instanceof SyntaxError) {
            this.setState({error: `Syntax Error: ${e.message}`});
        } else {
            this.setState({error: e.message});
        }
    }
    console.log(result);
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
        <button onClick={ this.computeDerivativeSource }>Run</button>
      </div>
    );
  }
}
CustomSourceBlock.propTypes = {
  sourceData: PropTypes.obj
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CustomSourceBlock)
