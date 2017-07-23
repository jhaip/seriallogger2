import React from 'react'
import PropTypes from 'prop-types'
import OverviewBlock from "./OverviewBlock"
import DetailBlock from "../containers/DetailBlock"

class App extends React.Component {
  render() {
    return (
      <div>
        <OverviewBlock />
        <DetailBlock />
      </div>
    );
  }
}

export default App
