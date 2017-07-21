import React from 'react'
import PropTypes from 'prop-types'
import AnnotationList from "../containers/AnnotationList"
import AddAnnotationBlock from  "./AddAnnotationBlock"

class AnnotationView extends React.Component {
  render() {
    return (
      <div>
        <AddAnnotationBlock />
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
