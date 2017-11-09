import React from 'react'
import PropTypes from 'prop-types'

class SourceEditor extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      'sourceDescription': props.sourceDescription
    };
    this.update = this.update.bind(this);
    this.save = this.save.bind(this);
    this.delete = this.delete.bind(this);
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.sourceDescription.name != this.props.sourceDescription.name) {
      this.setState({'sourceDescription': nextProps.sourceDescription});
    }
  }
  update(prop, event) {
    const newSourceDescription = Object.assign(this.state.sourceDescription, {
      [prop]: event.target.value
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
  render() {
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
          <label>Name:</label>
          <input
            type="text"
            value={this.state.sourceDescription.name || ''}
            onChange={(v) => this.update('name', v)}
          />
        </div>
        <div>
          <label>Description:</label>
          <input
            type="text"
            value={this.state.sourceDescription.description || ''}
            onChange={(v) => this.update('description', v)}
          />
        </div>
        <div>
          <label>URL:</label>
          <input
            type="text"
            value={this.state.sourceDescription.url || ''}
            onChange={(v) => this.update('url', v)}
          />
        </div>
        <div>
          <label>Request Type:</label>
          <input
            type="text"
            value={this.state.sourceDescription.request_type || ''}
            onChange={(v) => this.update('request_type', v)}
          />
        </div>
        <div>
          <label>Request Data:</label>
          <input
            type="text"
            value={this.state.sourceDescription.request_data || ''}
            onChange={(v) => this.update('request_data', v)}
          />
        </div>
        <div>
          <label>Headers:</label>
          <input
            type="text"
            value={this.state.sourceDescription.headers || ''}
            onChange={(v) => this.update('headers', v)}
          />
        </div>
        <div>
          <label>Transform Function:</label>
          <textarea
            style={{'width': '400px', 'height': '100px'}}
            value={this.state.sourceDescription.transform_function || ''}
            onChange={(v) => this.update('transform_function', v)}
          />
        </div>
        <div>
          <button onClick={this.save}>Save</button>
          { !this.props.isNew &&
            <button onClick={this.delete}>Delete</button>
          }
        </div>
      </div>
    );
  }
}
SourceEditor.propTypes = {
  sourceDescription: PropTypes.object.isRequired,
  isNew: PropTypes.bool.isRequired,
  saveSourceDescription: PropTypes.func.isRequired
};


export default SourceEditor
