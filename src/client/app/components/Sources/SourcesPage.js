import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import 'react-widgets/dist/css/react-widgets.css'
import DropdownList from 'react-widgets/lib/DropdownList'
import SourceEditor from './SourceEditor'
import { updateDataSource, fetchSourcesList } from '../../actions/DataSourceActions'
import { saveView } from '../../actions/ViewActions'


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
    },
    saveView: (page, opts) => {
      dispatch(saveView(page, opts));
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
  componentDidMount() {
    this.props.saveView("DATA SOURCES", {});
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
        <div style={{display: "flex"}}>
          <div style={{width: "250px"}}>
            <DropdownList
              data={availableSources}
              value={this.state.selectedSourceName}
              placeholder="Select a Data Source"
              onChange={(v) => this.setState({'selectedSourceName': v})}
            />
          </div>
          <div style={{marginLeft: "10px"}}>
            { this.state.selectedSourceName != '' &&
              <button
                className="btn btn-primary"
                style={{marginBottom: "10px"}}
                onClick={() => this.setState({'selectedSourceName': ''})}
              >
                Create New Source
              </button>
            }
          </div>
        </div>
        <SourceEditor
          sourceDescription={
            this.state.selectedSourceName != ''
            ? this.props.data[this.state.selectedSourceName]
            : {}
          }
          isNew={this.state.selectedSourceName == ''}
          saveSourceDescription={this.saveSourceDescription}
          data={this.props.data}
        />
      </div>
    );
  }
}
DataView.propTypes = {
  data: PropTypes.any.isRequired,
  saveSource: PropTypes.func.isRequired,
  saveView: PropTypes.func.isRequired
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(SourcesPage)
