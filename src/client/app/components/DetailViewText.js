import React from 'react'
import PropTypes from 'prop-types'
import DetailViewTimeGroup from "./DetailViewTimeGroup"

class DetailViewText extends React.Component {
  render() {
    const listRows = this.props.data.map((d) =>
      <DetailViewTimeGroup key={d.id}
                           {...d}
                           activeAnnotation={this.props.activeAnnotation}/>
    );
    return (
      <div className="selected-view__data">
        {listRows}
      </div>
    );
  }
}
DetailViewText.propTypes = {
  data: PropTypes.array,
  activeAnnotation: PropTypes.string.isRequired,
};

export default DetailViewText
