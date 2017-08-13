import React from 'react'
import { Route } from 'react-router-dom'
import { connect } from 'react-redux'
import { saveView } from '../actions/ViewActions'
import NotebookEntry from './NotebookEntry'
import NotebookList from './NotebookList'

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

class NotebookBase extends React.Component {
  componentDidMount() {
    this.props.saveView();
  }
  render() {
    console.log(this.props);
    return (
      <div className="notebook">
        <Route path={`${this.props.match.url}/:entryId`} component={NotebookEntry}/>
        <Route exact path={this.props.match.url} component={NotebookList}/>
      </div>
    );
  }
}

const Notebook = connect(
  mapStateToProps,
  mapDispatchToProps
)(NotebookBase)

export default Notebook
