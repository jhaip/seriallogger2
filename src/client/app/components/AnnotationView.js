import React from 'react'
import PropTypes from 'prop-types'
import AnnotationList from "../containers/AnnotationList"
import AddAnnotationBlock from  "../containers/AddAnnotationBlock"

class AnnotationView extends React.Component {
  render() {
    return (
      <div>
        <AddAnnotationBlock />
        <AnnotationList />
      </div>
    );
  }
}

export default AnnotationView
