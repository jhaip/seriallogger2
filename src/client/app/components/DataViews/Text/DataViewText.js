import React from 'react'
import PropTypes from 'prop-types'
import DataViewTimeGroup from "./DataViewTimeGroup"

class DataViewText extends React.Component {
  render() {
    const listRows = this.props.data.map((d) =>
      <DataViewTimeGroup key={`${d.sourceName}-${d.id}`}
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
DataViewText.propTypes = {
  data: PropTypes.array,
  activeAnnotation: PropTypes.string.isRequired,
};

export default DataViewText
