import React from 'react'
import PropTypes from 'prop-types'

class DetailViewTextRowSubtext extends React.Component {
  render() {
    let classes = "selected-text"
    for (var g in this.props.annotationGroups) {
      classes += ` selected-text--${g}`;
    }
    return (
      <span className={classes}>{this.props.text}</span>
    );
  }
}
DetailViewTextRowSubtext.propTypes = {
  annotationGroups: PropTypes.array.isRequired,
  text: PropTypes.string.isRequired
};

export default DetailViewTextRowSubtext
