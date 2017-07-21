import React from 'react'
import PropTypes from 'prop-types'

class AddAnnotationBlock extends React.Component {
  constructor(props) {
    super(props);
    this.state = {isEditing: false};
    this.onAddAnnotation = this.onAddAnnotation.bind(this);
    this.onSaveAnnotation = this.onSaveAnnotation.bind(this);
    this.onCancelAnnotation = this.onCancelAnnotation.bind(this);
  }

  onAddAnnotation(e) {
    e.preventDefault();
    // currentSelectionDetails = markSelection();
    // clearTextSelection();
    this.setState({
      isEditing: true
    });
  }

  onSaveAnnotation(e) {
    e.preventDefault();
    // onSaveAnnotation();
    this.setState({
      isEditing: false
    });
  }

  onCancelAnnotation(e) {
    e.preventDefault();
    this.setState({
      isEditing: false
    });
  }

  render() {
    return (
      <div>
        {
          this.state.isEditing ?
            <div>
              <input type="type"
                     className="selected-view__data-add-annotation-text"
                     onClick={this.onAddAnnotation} />
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

export default AddAnnotationBlock
