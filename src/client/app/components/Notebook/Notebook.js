import React from 'react'
import PropTypes from 'prop-types'
import { Route } from 'react-router-dom'
import { connect } from 'react-redux'
import { saveView } from '../../actions/ViewActions'
import NotebookEntry from './NotebookEntry'
import NotebookList from './NotebookList'

const mapStateToProps = state => {
  return {}
}

const mapDispatchToProps = dispatch => {
  return {
    saveView: (page, opts) => {
      dispatch(saveView(page, opts));
    }
  }
}

class Notebook extends React.Component {
  componentDidMount() {
    this.props.saveView("NOTEBOOK", {});
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
Notebook.propTypes = {
  saveView: PropTypes.func.isRequired
};

export default connect(mapStateToProps, mapDispatchToProps)(Notebook)
