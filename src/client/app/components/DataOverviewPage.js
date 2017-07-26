import React from 'react'
import PropTypes from 'prop-types'
import OverviewBlock from "./OverviewBlock"
import DetailBlock from "../containers/DetailBlock"

export default class DataOverviewPage extends React.Component {
  render() {
    return (
      <div>
        <OverviewBlock />
        <DetailBlock />
      </div>
    );
  }
}
