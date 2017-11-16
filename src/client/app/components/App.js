import React from 'react'
import PropTypes from 'prop-types'
import {
  BrowserRouter as Router,
  Route,
  Link
} from 'react-router-dom'
import Notebook from './Notebook/Notebook'
import DataOverviewPage from './DataOverviewPage'
import SourcesPage from './Sources/SourcesPage'
import DerivativeSourcesPage from './DerivativeSourcesPage'


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
            <div style={{display: "inline-block", paddingRight: "20px"}}>
              <Link to="/sources/">Edit Sources</Link>
            </div>
            <div style={{display: "inline-block", paddingRight: "20px"}}>
              <Link to="/derivative-sources/">Derivative Sources</Link>
            </div>
          </div>
          <div style={{padding: "0 10px 10px 10px"}}>
            <Route exact path="/" component={DataOverviewPage}/>
            <Route path="/notebook/" component={Notebook}/>
            <Route path="/sources/" component={SourcesPage}/>
            <Route path="/derivative-sources/" component={DerivativeSourcesPage}/>
          </div>
        </div>
      </Router>
    );
  }
}

export default App
