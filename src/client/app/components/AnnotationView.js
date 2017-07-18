import React from 'react'
import PropTypes from 'prop-types'
import AnnotationList from "../containers/AnnotationList"

class AnnotationView extends React.Component {
  constructor(props) {
    super(props);
    this.onAddAnnotation = this.onAddAnnotation.bind(this);
    this.onSaveAnnotation = this.onSaveAnnotation.bind(this);
    this.onCancelAnnotation = this.onCancelAnnotation.bind(this);
  }

  onAddAnnotation(e) {
    e.preventDefault();
    currentSelectionDetails = markSelection();
    clearTextSelection();
    $(".selected-view__new-annotation-input-container").show();
    $(".selected-view__new-annotation-input").focus();
  }

  onSaveAnnotation(e) {
    e.preventDefault();
    onSaveAnnotation();
  }

  onCancelAnnotation(e) {
    e.preventDefault();
    onCancelAnnotation();
  }

  render() {
    return (
      <div>
        <input type="submit"
               value="Add Annotation"
               className="selected-view__data-add-annotation"
               onClick={this.onAddAnnotation} />
        <div className="selected-view__new-annotation-input-container">
          <input type="text" className="selected-view__new-annotation-input" />
          <div>
            <input type="submit"
                   value="Save"
                   className="selected-view__data-save-annotation"
                   onClick={this.onSaveAnnotation} />
            <input type="submit"
                   value="Cancel"
                   className="selected-view__data-cancel-add-annotation"
                   onClick={this.onCancelAnnotation} />
          </div>
        </div>

        <AnnotationList />
      </div>
    );
  }
}
AnnotationView.propTypes = {};

export default AnnotationView
