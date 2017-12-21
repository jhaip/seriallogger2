import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import DerivativeView from "./DerivativeView"
import { saveView } from '../../actions/ViewActions'

const mapStateToProps = state => {
  return {
    views: state.dataview.views
  }
}

const mapDispatchToProps = dispatch => {
  return {
    saveView: (page, opts) => {
      dispatch(saveView(page, opts));
    }
  }
}

class DerivativeSourcesPage extends React.Component {
  componentDidMount() {
    this.props.saveView("DERIVATIVE SOURCE", {});
  }
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
  views: PropTypes.array.isRequired,
  saveView: PropTypes.func.isRequired
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(DerivativeSourcesPage)
