import React from 'react'
import PropTypes from 'prop-types'
import 'react-widgets/dist/css/react-widgets.css'
import DropdownList from 'react-widgets/lib/DropdownList'
import Multiselect from 'react-widgets/lib/Multiselect'
import {Controlled as CodeMirror} from 'react-codemirror2'
import 'codemirror/lib/codemirror.css'
import 'codemirror/mode/javascript/javascript'
import 'codemirror/mode/python/python'
import { pick } from 'lodash'

class SourceEditor extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      sourceDescription: props.sourceDescription,
      input: ''
    };
    this.update = this.update.bind(this);
    this.save = this.save.bind(this);
    this.delete = this.delete.bind(this);
    this.update_dependencies = this.update_dependencies.bind(this);
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.sourceDescription.name != this.props.sourceDescription.name) {
      this.setState({'sourceDescription': nextProps.sourceDescription});
    }
  }
  update(prop, event, val) {
    const value = (val) ? val : event.target.value;
    const newSourceDescription = Object.assign(this.state.sourceDescription, {
      [prop]: value
    });
    this.setState({'sourceDescription': newSourceDescription});
  }
  save(event) {
    this.props.saveSourceDescription(
      this.state.sourceDescription,
      this.props.isNew ? 'create' : 'update'
    );
  }
  delete(event) {
    this.props.saveSourceDescription(this.state.sourceDescription, 'delete');
  }
  update_dependencies(dependency_names) {
    // TODO
    const dependencies = Object.keys(this.props.data).filter(key => {
      return dependency_names.indexOf(key) >= 0
    }).map(key => {
      return pick(this.props.data[key], ["id", "name"]);
    });
    this.update('dependencies', null, dependencies);
  }
  render() {
    const availableSourceNames = Object.keys(this.props.data);
    const dependencies = (this.state.sourceDescription.dependencies || []).map(d => d.name);
    return (
      <div className="source-editor">
        <div>
          <h2>
            {
              this.props.isNew
              ? 'Create a new data source'
              : `Editing data source ${this.state.sourceDescription.name}`
            }
          </h2>
          <form style={{width: "600px"}}>
            <div className="form-group">
              <label>Name</label>
              <input
                type="text"
                className="form-control"
                placeholder="Name"
                value={this.state.sourceDescription.name || ''}
                onChange={(v) => this.update('name', v)}
              />
            </div>
            <div className="form-group">
              <label>Description</label>
              <input
                type="text"
                className="form-control"
                placeholder="Description"
                value={this.state.sourceDescription.description || ''}
                onChange={(v) => this.update('description', v)}
              />
            </div>
            <div className="form-group">
              <label>Dependencies</label>
              <div>
                <Multiselect
                  value={dependencies}
                  data={availableSourceNames}
                  placeholder="Dependencies"
                  onChange={(v) => this.update_dependencies(v)}
                />
              </div>
            </div>
            <div className="form-group">
              <label>Transform Function Language</label>
                <DropdownList
                  data={["", "python", "INTERNAL"]}
                  value={this.state.sourceDescription.transform_function_language || ""}
                  placeholder="Select a language"
                  onChange={(v) => this.update('transform_function_language', null, v)}
                />
            </div>
            <div className="form-group">
              <label>Transform Function</label>
              <div style={{border: "1px solid #CCC"}}>
                <CodeMirror
                  value={this.state.sourceDescription.transform_function || ''}
                  onBeforeChange={(editor, data, value) => {
                    this.update('transform_function', null, value);
                  }}
                  options={{
                    lineNumbers: true,
                    mode: 'python'
                  }}
                />
              </div>
            </div>
            <div className="form-group">
              <label>Data Type</label>
                <DropdownList
                  data={["", "TEXT", "HTML"]}
                  value={this.state.sourceDescription.data_type || ""}
                  placeholder="Data Type"
                  onChange={(v) => this.update('data_type', null, v)}
                />
            </div>
          </form>
        </div>
        <div style={{marginTop: "10px"}}>
          <button className="btn btn-primary" onClick={this.save}>Save</button>
          { !this.props.isNew &&
            <button
              style={{marginLeft: "10px"}}
              className="btn btn-default"
              onClick={this.delete}
            >
              Delete
            </button>
          }
        </div>
      </div>
    );
  }
}
SourceEditor.propTypes = {
  sourceDescription: PropTypes.object.isRequired,
  isNew: PropTypes.bool.isRequired,
  saveSourceDescription: PropTypes.func.isRequired,
  data: PropTypes.any.isRequired
};


export default SourceEditor
