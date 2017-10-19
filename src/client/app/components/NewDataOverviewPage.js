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

class NewDataOverviewPage extends React.Component {
  render() {
    const list = this.props.views.map(v => {
      return (
        <div>
          <h2>Todo View</h2>
          <DataView
            sourceNames={v.sourceNames}
            start={v.start}
            end={v.end}
            visualType={v.visualType}
          ></DataView>
        </div>
      );
    });
    return (
      <div>
        { list }
      </div>
    );
  }
}
NewDataOverviewPage.propTypes = {
  views: PropTypes.array.isRequired
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(NewDataOverviewPage)
