import React from 'react'
import PropTypes from 'prop-types'
import DataViewTextRowSubtext from  "./DataViewTextRowSubtext"

class DataViewTextRow extends React.Component {
  render() {
    let k = 0;
    const childrenn = this.props.childrenData.map((c) => {
      return (
        <DataViewTextRowSubtext text={c.text}
                                  key={k++}
                                  annotationGroups={c.annotationGroups}
                                  activeAnnotation={this.props.activeAnnotation} />
      )
    })
    return (
      <pre className={"row row-rn-"+this.props.id}
           data-rn={this.props.rowNumber}
           data-rowinvalue={this.props.rowInValue}
           data-dataid={this.props.id}
           data-datasource={this.props.sourceName}
           data-datatype={this.props.type || ''}
           data-datatimestamp={this.props.timestamp} >
        {childrenn}
      </pre>
    );
  }
}
DataViewTextRow.propTypes = {
  id: PropTypes.any.isRequired,
  rowNumber: PropTypes.number.isRequired,
  sourceName: PropTypes.string.isRequired,
  type: PropTypes.string,
  timestamp: PropTypes.any.isRequired,
  childrenData: PropTypes.array.isRequired,
  activeAnnotation: PropTypes.string.isRequired
};

export default DataViewTextRow
