import React from 'react'
import PropTypes from 'prop-types'
import {
  BrowserRouter as Router,
  Route,
  Link
} from 'react-router-dom'
import Notebook from './Notebook/Notebook'
import DataOverviewPage from './DataOverviewPage'


class App extends React.Component {
  render() {
    return (
      <Router>
        <div>
          <div style={{backgroundColor: "#EEE", padding: "10px", marginBottom: "10px"}}>
            <div style={{display: "inline-block", paddingRight: "20px"}}>
              <Link to="/">Data Overview</Link>
            </div>
            <div style={{display: "inline-block", paddingRight: "20px"}}>
              <Link to="/notebook/">Notebook</Link>
            </div>
          </div>
          <div style={{padding: "10px"}}>
            <Route exact path="/" component={DataOverviewPage}/>
            <Route path="/notebook/" component={Notebook}/>
          </div>
        </div>
      </Router>
    );
  }
}

export default App
