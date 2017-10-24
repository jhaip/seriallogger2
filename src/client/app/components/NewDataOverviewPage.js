import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import DataView from "./DataView"
import DerivativeView from "./DerivativeView"

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
      if (v.visualType === "derivative") {
        return (
          <DerivativeView
            sourceNames={v.sourceNames}
            start={v.start}
            stop={v.stop}
            visualType={v.visualType}
            id={v.id}
            key={v.id}
          />
        );
      } else {
        return (
          <DataView
            sourceNames={v.sourceNames}
            start={v.start}
            stop={v.stop}
            visualType={v.visualType}
            id={v.id}
            key={v.id}
          />
        );
      }
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
