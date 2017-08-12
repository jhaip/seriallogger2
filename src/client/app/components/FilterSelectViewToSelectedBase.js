import React from 'react'
import PropTypes from 'prop-types'

class FilterSelectViewToSelectedBase extends React.Component {
  render() {
    return (
      <div>
        <input type="submit"
               value="Narrow to Selected"
               className="selected-view__narrow-to-selected"
               onClick={this.props.onClick} />
      </div>
    );
  }
}
FilterSelectViewToSelectedBase.propTypes = {
  onClick: PropTypes.func.isRequired
};

export default FilterSelectViewToSelectedBase
