import React from 'react'
import PropTypes from 'prop-types'
import AnnotationList from "../containers/AnnotationList"
import AddAnnotationBlock from  "../containers/AddAnnotationBlock"
import FilterSelectViewToSelected from "../containers/FilterSelectViewToSelected"

class AnnotationView extends React.Component {
  render() {
    return (
      <div>
        <div style={{marginBottom: "10px"}}>
          <FilterSelectViewToSelected />
        </div>
        <div style={{marginBottom: "10px"}}>
          <AddAnnotationBlock />
        </div>
        <AnnotationList />
      </div>
    );
  }
}

export default AnnotationView
