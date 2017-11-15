import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import {
  setPotentialAnnotation,
  clearPotentialAnnotation,
  saveNewAnnotation
} from '../../actions/AnnotationActions'

const mapStateToProps = state => {
  return {}
}

const mapDispatchToProps = (dispatch, props) => {
  return {
    onStartAnnotation: () => {
      dispatch(setPotentialAnnotation(props.dataViewId));
    },
    onStopAnnotation: () => {
      dispatch(clearPotentialAnnotation(props.dataViewId));
    },
    saveNewAnnotation: (annotation) => {
      return dispatch(saveNewAnnotation(annotation));
    }
  }
}

class AddAnnotationBlock extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isEditing: false,
      annotationValue: "",
      isSaving: false
    };
    this.handleChange = this.handleChange.bind(this);
    this.onAddAnnotation = this.onAddAnnotation.bind(this);
    this.onSaveAnnotation = this.onSaveAnnotation.bind(this);
    this.onCancelAnnotation = this.onCancelAnnotation.bind(this);
  }

  handleChange(event) {
    this.setState({annotationValue: event.target.value});
  }

  onAddAnnotation(e) {
    e.preventDefault();
    this.props.onStartAnnotation();
    this.setState({
      isEditing: true,
      annotationValue: "",
      isSaving: false
    });
  }

  onSaveAnnotation(e) {
    e.preventDefault();
    this.setState({
      isSaving: true
    });
    this.props.saveNewAnnotation(this.state.annotationValue)
      .then(() => {
        console.log("SUCCESSFUL SAVE!");
        this.setState({
          isEditing: false
        });
        this.props.onStopAnnotation();
      });
  }

  onCancelAnnotation(e) {
    e.preventDefault();
    this.setState({
      isEditing: false
    });
    this.props.onStopAnnotation();
  }

  render() {
    return (
      <div>
        {
          this.state.isEditing ?
            <div>
              <h5>New Annotation:</h5>
              <input type="type"
                     style={{marginBottom: "5px"}}
                     className="selected-view__data-add-annotation-text form-control"
                     onChange={this.handleChange}
                     value={this.state.annotationValue}
                     disabled={this.state.isSaving} />
              <div>
                <input type="submit"
                       value="Save"
                       className="selected-view__data-save-annotation btn btn-primary btn-sm"
                       onClick={this.onSaveAnnotation} />
                <input type="submit"
                       value="Cancel"
                       style={{marginLeft: "5px"}}
                       className="selected-view__data-cancel-annotation btn btn-default btn-sm"
                       onClick={this.onCancelAnnotation} />
              </div>
            </div>
          : <input type="submit"
                 value="Add Annotation"
                 className="selected-view__data-add-annotation btn btn-default"
                 onClick={this.onAddAnnotation} />
        }
      </div>
    );
  }
}
AddAnnotationBlock.propTypes = {
  onStartAnnotation: PropTypes.func.isRequired,
  onStopAnnotation: PropTypes.func.isRequired,
  saveNewAnnotation: PropTypes.func.isRequired,
  dataViewId: PropTypes.string.isRequired
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(AddAnnotationBlock)
