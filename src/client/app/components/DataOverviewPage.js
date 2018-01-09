import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import DataView from "./DataView"
import { saveView } from '../actions/ViewActions'
import { isEqual } from 'lodash'

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

class DataOverviewPage extends React.Component {
  componentDidMount() {
    this.props.saveView("DATA OVERVIEW", {});
  }
  componentWillReceiveProps(nextProps) {
    // TODO: don't resave view if the view was refreshed because of long polling
    if (
      this.props.views &&
      this.props.views.length > 0 &&
      nextProps.views &&
      nextProps.views.length > 0 &&
      !isEqual(this.props.views, nextProps.views)
    ) {
      const v = nextProps.views[0];
      this.props.saveView("DATA VIEW", {
        "sources": v.sourceNames,
        "start": v.start,
        "stop": v.stop,
        "visualType": v.visualType
      });
    }
  }
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
  views: PropTypes.array.isRequired,
  saveView: PropTypes.func.isRequired
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(DataOverviewPage)
