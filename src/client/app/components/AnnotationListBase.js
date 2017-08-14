import React from 'react'
import PropTypes from 'prop-types'
import AnnotationListItem from  "./AnnotationListItem"

class AnnotationListBase extends React.Component {
  render() {
    let k = 0;
    const list = this.props.annotations.map((annotation) => {
      return <AnnotationListItem key={k++}
                                 annotation={annotation}
                                 activeAnnotation={this.props.activeAnnotation}
                                 handleClick={this.props.handleClick} />
    });
    return (
      <div>
        <strong>Annotations:</strong>
        <div>
          {list}
        </div>
        {(this.props.activeAnnotation === "") ?
          null :
          <button onClick={this.props.clearActiveAnnotation}
                  style={{marginTop: "10px"}}>
            Clear Selection
          </button>}
      </div>
    );
  }
}
AnnotationListBase.propTypes = {
  annotations: PropTypes.array.isRequired,
  activeAnnotation: PropTypes.string.isRequired,
  handleClick: PropTypes.func.isRequired,
  clearActiveAnnotation: PropTypes.func.isRequired
};

export default AnnotationListBase
