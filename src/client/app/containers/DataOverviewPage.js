import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { saveView } from '../actions/ViewActions'
import OverviewBlock from "../components/OverviewBlock"
import DetailBlock from "./DetailBlock"
import CustomSourceBlock from "./CustomSourceBlock"

const mapStateToProps = state => {
  return {}
}

const mapDispatchToProps = dispatch => {
  return {
    saveView: () => {
      dispatch(saveView());
    }
  }
}

class DataOverviewPageBase extends React.Component {
  componentDidMount() {
    this.props.saveView();
  }
  render() {
    return (
      <div>
        <OverviewBlock />
        <CustomSourceBlock />
        <DetailBlock />
      </div>
    );
  }
}

const DataOverviewPage = connect(
  mapStateToProps,
  mapDispatchToProps
)(DataOverviewPageBase)

export default DataOverviewPage
