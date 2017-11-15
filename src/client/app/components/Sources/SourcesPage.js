import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import 'react-widgets/dist/css/react-widgets.css'
import DropdownList from 'react-widgets/lib/DropdownList'
import SourceEditor from './SourceEditor'
import { updateDataSource, fetchSourcesList } from '../../actions/DataSourceActions'


const mapStateToProps = (state, props) => {
  return {
    data: state.data
  }
}

const mapDispatchToProps = dispatch => {
  return {
    saveSource: (sourceDescription, action) => {
      dispatch(updateDataSource(sourceDescription, action)).then(() => {
        dispatch(fetchSourcesList());
      });
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
  componentWillReceiveProps(nextProps) {
    if (!nextProps.data.hasOwnProperty(this.state.selectedSourceName)) {
      this.setState({'selectedSourceName': ''});
    }
  }
  saveSourceDescription(sourceDescription, action) {
    this.props.saveSource(sourceDescription, action);
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
          placeholder="Select a Data Source"
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
