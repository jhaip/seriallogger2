import React from 'react'
import PropTypes from 'prop-types'
import DataViewTimeGroup from "./DataViewTimeGroup"

class DataViewText extends React.Component {
  shouldComponentUpdate(nextProps, nextState) {
    if (
      this.props.data.length > 0 &&
      this.props.data.length == nextProps.data.length &&
      this.props.data[0].id == nextProps.data[0].id &&
      this.props.data[this.props.data.length-1].id == nextProps.data[nextProps.data.length-1].id
    ) {
      return false;
    }
    return true;
  }
  render() {
    const listRows = this.props.data.map((d) =>
      <DataViewTimeGroup key={`${d.sourceName}-${d.id}`}
                           {...d}
                           activeAnnotation={this.props.activeAnnotation}/>
    );
    return (
      <div className="selected-view__data">
        <div style={{overflow: "hidden", flexGrow: 1, position: "relative"}}>
          <div style={{position: "absolute", overflow: "scroll", top: 0, bottom: 0, left: 0, right: 0}}>
            {listRows}
          </div>
        </div>
      </div>
    );
  }
}
DataViewText.propTypes = {
  data: PropTypes.array,
  activeAnnotation: PropTypes.string.isRequired,
};

export default DataViewText
