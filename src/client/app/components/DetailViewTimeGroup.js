import React from 'react'
import PropTypes from 'prop-types'
import DetailViewTextRow from "./DetailViewTextRow"
import DetailViewTimestampRow from "./DetailViewTimestampRow"

let rn = 0; // BAD global state
class DetailViewTimeGroup extends React.Component {
  render() {
    const listRows = this.props.rows.map((r) => {
      return (
        <DetailViewTextRow id={this.props.id}
                           key={r.rowNumber}
                           rowNumber={r.rowNumber}
                           source={this.props.source}
                           type={this.props.type}
                           timestamp={this.props.timestamp}
                           childrenData={r.children}
                           activeAnnotation={this.props.activeAnnotation} />
      );
    })
    return (
      <div>
        <DetailViewTimestampRow timestamp={this.props.timestamp} />
        {listRows}
      </div>
    );
  }
}
DetailViewTimeGroup.propTypes = {
  id: PropTypes.any.isRequired,
  source: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
  timestamp: PropTypes.any.isRequired,
  activeAnnotation: PropTypes.string.isRequired,
};

export default DetailViewTimeGroup
