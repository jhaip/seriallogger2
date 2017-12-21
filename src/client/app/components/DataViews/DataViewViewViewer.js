import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import moment from 'moment'
import {
  changeDataViewVisualType,
  changeDataViewStart,
  changeDataViewEnd,
  changeDataViewSourceNames
} from '../../actions/DataViewActions'


const mapStateToProps = (state, props) => {
  return {
    mainDataViewId: state.dataview.views[0].id
  }
}

const mapDispatchToProps = dispatch => {
  return {
    useSavedView: (dataViewId, visualType, start, end, sourceNames) => {
      dispatch(changeDataViewVisualType(dataViewId, visualType));
      dispatch(changeDataViewStart(dataViewId, start));
      dispatch(changeDataViewEnd(dataViewId, end));
      dispatch(changeDataViewSourceNames(dataViewId, sourceNames));
    }
  }
}


class DataViewViewViewer extends React.Component {
  constructor(props) {
    super(props);
    this.useSavedView = this.useSavedView.bind(this);
  }
  useSavedView(page, description) {
    console.log(page);
    if (page == "DATA VIEW") {
      console.log("use saved view");
      this.props.useSavedView(
        this.props.mainDataViewId,
        description.visualType,
        moment.utc(description.start).toDate(),
        moment.utc(description.stop).toDate(),
        description.sources
      );
    }
  }
  render() {
    const list = this.props.data.map(d => {
      const val = JSON.parse(d.value);
      return (
        <div key={d.id}>
          <h5>
            <i>{moment.utc(d.timestamp).toISOString()}</i>
            {": "}
            {val.page}
          </h5>
          { val.page == "DATA VIEW" &&
            Object.keys(val.description).length !== 0 &&
            <div>
              <p style={{color: '#555'}}>
                <button
                  type="button"
                  className="btn btn-primary btn-xs"
                  onClick={ () => this.useSavedView(val.page, val.description) }
                >
                  {"View"}
                </button>
                <strong style={{paddingLeft: '10px'}}>
                  {val.description.visualType}
                </strong>
                {" : "}
                <i>{moment.utc(val.description.start).toISOString()}</i>
                {" - "}
                <i>{moment.utc(val.description.stop).toISOString()}</i>
                {" : "}
                {JSON.stringify(val.description.sources)}
              </p>
            </div>
          }
        </div>
      );
    });
    return (
      <div className="selected-view__global-timeline">
        <div style={{overflow: 'hidden', flexGrow: 1, position: 'relative'}}>
          <div style={{position: "absolute", overflow: "scroll", top: 0, bottom: 0, left: 0, right: 0}}>
            {list}
          </div>
        </div>
      </div>
    );
  }
}
DataViewViewViewer.propTypes = {
  data: PropTypes.array,
  activeAnnotation: PropTypes.string.isRequired,
  start: PropTypes.instanceOf(Date).isRequired,
  stop: PropTypes.instanceOf(Date).isRequired,
  useSavedView: PropTypes.func.isRequired
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(DataViewViewViewer)
