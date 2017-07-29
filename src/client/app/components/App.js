import React from 'react'
import PropTypes from 'prop-types'
import {
  BrowserRouter as Router,
  Route,
  Link
} from 'react-router-dom'
import DataOverviewPage from '../containers/DataOverviewPage'
import Notebook from '../containers/Notebook'


class App extends React.Component {
  render() {
    return (
      <Router>
        <div>
          <ul>
            <li><Link to="/">Data Overview</Link></li>
            <li><Link to="/notebook/">Notebook</Link></li>
          </ul>
          <hr/>
          <div>
            <Route exact path="/" component={DataOverviewPage}/>
            <Route path="/notebook/" component={Notebook}/>
          </div>
        </div>
      </Router>
    );
  }
}

export default App
