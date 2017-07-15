import React from 'react'
import PropTypes from 'prop-types'
import DetailViewTextRow from "./DetailViewTextRow"
import DetailViewTimestampRow from "./DetailViewTimestampRow"

let rn = 0; // BAD global state
class DetailViewTimeGroup extends React.Component {
  render() {
    let listRows = [];
    let lines = this.props.value.split(/\r\n/);
    for (let i = 0; i < lines.length; i+=1) {
      let subline = lines[i].split(/\n/);
      for (let y = 0; y < subline.length; y+=1) {
        listRows.push((
          <DetailViewTextRow id={this.props.id}
                             key={rn}
                             rowNumber={rn}
                             source={this.props.source}
                             type={this.props.type}
                             timestamp={this.props.timestamp}
                             text={subline[y]} />
        ));
        rn += 1;
      }
    }
    return (
      <div>
        <DetailViewTimestampRow timestamp={this.props.timestamp} />
        {listRows}
      </div>
    );
  }
}
DetailViewTimeGroup.propTypes = {
  value: PropTypes.string.isRequired,
  id: PropTypes.number.isRequired,
  source: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
  timestamp: PropTypes.string.isRequired
};

export default DetailViewTimeGroup
