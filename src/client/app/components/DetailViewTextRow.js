import React from 'react'
import PropTypes from 'prop-types'
import DetailViewTextRowSubtext from  "./DetailViewTextRowSubtext"

class DetailViewTextRow extends React.Component {
  render() {
    const childrenn = this.props.childrenData.map((c) => {
      return (
        <DetailViewTextRowSubtext text={c.text}
                                  annotationGroups={c.annotationGroups} />
      )
    })
    return (
      <pre className={"row row-rn-"+this.props.id}
           data-rn={this.props.rowNumber}
           data-dataid={this.props.id}
           data-datasource={this.props.source}
           data-datatype={this.props.type}
           data-datatimestamp={this.props.timestamp} >
        {childrenn}
      </pre>
    );
  }
}
DetailViewTextRow.propTypes = {
  id: PropTypes.any.isRequired,
  rowNumber: PropTypes.number.isRequired,
  source: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
  timestamp: PropTypes.any.isRequired,
  childrenData: PropTypes.array.isRequired
};

export default DetailViewTextRow
