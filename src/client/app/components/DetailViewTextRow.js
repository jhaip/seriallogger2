import React from 'react'
import PropTypes from 'prop-types'

class DetailViewTextRow extends React.Component {
    render() {
      return (
          <pre className={"row row-rn-"+this.props.id}
               data-rn={this.props.rowNumber}
               data-dataid={this.props.id}
               data-datasource={this.props.dataSource}
               data-datatype={this.props.dataType}
               data-datatimestamp={this.props.dataTimestamp} >
            {this.props.text}
          </pre>
      );
    }
}
DetailViewTextRow.propTypes = {
  id: PropTypes.number.isRequired,
  rowNumber: PropTypes.number.isRequired,
  source: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
  timestamp: PropTypes.string.isRequired,
  text: PropTypes.string.isRequired
};

export default DetailViewTextRow
