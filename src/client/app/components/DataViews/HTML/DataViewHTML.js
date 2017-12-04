import React from 'react'
import PropTypes from 'prop-types'


class DataViewHTML extends React.Component {
  render() {
    const __html = this.props.data.map(d => d["value"]).join("");
    const html = {__html};
    return (
      <div className="selected-view__data-line-graph">
        <div dangerouslySetInnerHTML={html} />
      </div>
    );
  }
}
DataViewHTML.propTypes = {
  data: PropTypes.array,
  activeAnnotation: PropTypes.string.isRequired,
};

export default DataViewHTML
