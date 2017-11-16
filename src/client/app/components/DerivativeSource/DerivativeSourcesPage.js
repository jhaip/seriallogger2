import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import DerivativeView from "./DerivativeView"

const mapStateToProps = state => {
  return {
    views: state.dataview.views
  }
}

const mapDispatchToProps = dispatch => {
  return {}
}

class DerivativeSourcesPage extends React.Component {
  render() {
    const v = this.props.views.length ? this.props.views[1] : null;
    return (
      <div>
        { v &&
          <DerivativeView
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

DerivativeSourcesPage.propTypes = {
  views: PropTypes.array.isRequired
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(DerivativeSourcesPage)
