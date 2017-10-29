import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import {
  setPotentialAnnotation,
  clearPotentialAnnotation,
  saveNewAnnotation
} from '../actions/AnnotationActions'

const mapStateToProps = state => {
  return {}
}

const mapDispatchToProps = dispatch => {
  return {
    onStartAnnotation: () => {
      dispatch(setPotentialAnnotation());
    },
    onStopAnnotation: () => {
      dispatch(clearPotentialAnnotation());
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
              <input type="type"
                     className="selected-view__data-add-annotation-text"
                     onChange={this.handleChange}
                     value={this.state.annotationValue}
                     disabled={this.state.isSaving} />
              <div>
                <input type="submit"
                       value="Save"
                       className="selected-view__data-save-annotation"
                       onClick={this.onSaveAnnotation} />
                <input type="submit"
                       value="Cancel"
                       className="selected-view__data-cancel-annotation"
                       onClick={this.onCancelAnnotation} />
              </div>
            </div>
          : <input type="submit"
                 value="Add Annotation"
                 className="selected-view__data-add-annotation"
                 onClick={this.onAddAnnotation} />
        }
      </div>
    );
  }
}
AddAnnotationBlock.propTypes = {
  onStartAnnotation: PropTypes.func.isRequired,
  onStopAnnotation: PropTypes.func.isRequired,
  saveNewAnnotation: PropTypes.func.isRequired
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(AddAnnotationBlock)
