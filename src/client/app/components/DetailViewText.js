import React from 'react'
import PropTypes from 'prop-types'
import DetailViewTimeGroup from "./DetailViewTimeGroup"

class DetailViewText extends React.Component {
  render() {
    const listRows = this.props.data.map((d) =>
      <DetailViewTimeGroup key={d.id} {...d} />
    );
    return (
      <div>
        {listRows}
      </div>
    );
  }
}
DetailViewText.propTypes = {
  data: PropTypes.array
};

export default DetailViewText
