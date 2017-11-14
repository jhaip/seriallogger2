import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import DataView from "./DataView"

const mapStateToProps = state => {
  return {
    views: state.dataview.views
  }
}

const mapDispatchToProps = dispatch => {
  return {}
}

class DataOverviewPage extends React.Component {
  render() {
    const v = this.props.views.length ? this.props.views[0] : null;
    return (
      <div>
        { v &&
          <DataView
            sourceNames={v.sourceNames}
            start={v.start}
            stop={v.stop}
            visualType={v.visualType}
            id={v.id}
            key={v.id}
          />
        }
      </div>
    );
  }
}
DataOverviewPage.propTypes = {
  views: PropTypes.array.isRequired
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(DataOverviewPage)
