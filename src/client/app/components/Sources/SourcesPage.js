import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import 'react-widgets/dist/css/react-widgets.css'
import DropdownList from 'react-widgets/lib/DropdownList'
import SourceEditor from './SourceEditor'


const mapStateToProps = (state, props) => {
  return {
    data: state.data
  }
}

const mapDispatchToProps = dispatch => {
  return {
    saveSource: () => {
      console.log("TODO: save source");
    }
  }
}

class SourcesPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      'selectedSourceName': ''
    };
    this.saveSourceDescription = this.saveSourceDescription.bind(this);
  }
  saveSourceDescription(sourceDescription, action) {
    switch(action) {
      case 'create':
        console.log("TODO: create");
        break;
      case 'update':
        console.log("TODO: update");
        break;
      case 'delete':
        console.log("TODO: delete");
        break;
    }
  }
  render() {
    const availableSources = Object.keys(this.props.data).filter((key) => {
      return this.props.data[key].request_type !== 'DERIVATIVE';
    });
    return (
      <div>
        { this.state.selectedSourceName != '' &&
          <button
            onClick={() => this.setState({'selectedSourceName': ''})}
          >
            Create New Source
          </button>
        }
        <DropdownList
          data={availableSources}
          value={this.state.selectedSourceName}
          onChange={(v) => this.setState({'selectedSourceName': v})}
        />
        <SourceEditor
          sourceDescription={
            this.state.selectedSourceName != ''
            ? this.props.data[this.state.selectedSourceName]
            : {}
          }
          isNew={this.state.selectedSourceName == ''}
          saveSourceDescription={this.saveSourceDescription}
        />
      </div>
    );
  }
}
DataView.propTypes = {
  data: PropTypes.any.isRequired,
  saveSource: PropTypes.func.isRequired
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(SourcesPage)
