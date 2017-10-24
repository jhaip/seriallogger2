import React from 'react'
import PropTypes from 'prop-types'
import DetailViewTextRow from "./DetailViewTextRow"
import DetailViewTimestampRow from "./DetailViewTimestampRow"

let rn = 0; // BAD global state
class DetailViewTimeGroup extends React.Component {
  render() {
    const listRows = this.props.rows.map((r) => {
      return (
        <DetailViewTextRow id={r.id}
                           key={r.rowNumber}
                           rowNumber={r.rowNumber}
                           rowInValue={r.rowInValue}
                           sourceName={this.props.sourceName}
                           type={this.props.type}
                           timestamp={this.props.timestamp}
                           childrenData={r.children}
                           activeAnnotation={this.props.activeAnnotation} />
      );
    })
    return (
      <div>
        <DetailViewTimestampRow
          timestamp={this.props.timestamp}
          sourceName={this.props.sourceName} />
        {listRows}
      </div>
    );
  }
}
DetailViewTimeGroup.propTypes = {
  id: PropTypes.any.isRequired,
  sourceName: PropTypes.string.isRequired,
  type: PropTypes.string,
  timestamp: PropTypes.any.isRequired,
  activeAnnotation: PropTypes.string.isRequired,
};

export default DetailViewTimeGroup
