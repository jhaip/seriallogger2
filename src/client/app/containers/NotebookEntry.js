import React from 'react'
import PropTypes from 'prop-types'
import marksy from 'marksy/components'
import moment from 'moment'
import { connect } from 'react-redux'
import {
  fetchNotebookEntry,
  updateNotebookEntry
} from '../actions/NotebookActions'
import NotebookEmbed from '../components/NotebookEmbed'

const mapStateToProps = state => {
  return {
    entry: state.notebook.active_entry
  }
}

const mapDispatchToProps = dispatch => {
  return {
    fetchNotebookEntry: (entry_id) => {
      dispatch(fetchNotebookEntry(entry_id))
    },
    updateNotebookEntry: (new_entry_text) => {
      dispatch(updateNotebookEntry(new_entry_text))
    }
  }
}

const compile = marksy({
  createElement: React.createElement,
  components: {
    Row ({children}) {
      return <div style={{display: 'flex'}}>{children}</div>
    },
    Col ({children}) {
      return <div style={{flex: '1', padding: '10px', backgroundColor: '#DADADA', border: '1px solid #333'}}>{children}</div>
    },
    Embed (props) {
      return (
        <NotebookEmbed source={props.source}
                       start={moment(props.start).toDate()}
                       end={moment(props.end).toDate()} />
      )
    },
    InlineEmbed() {
      return (
        <img src="https://origin2.cdn.componentsource.com/sites/default/files/styles/logo_medium/public/images/product_screenshot/componentone/componentone-ultimate/img_485611.png?itok=WgGaoLha"></img>
      )
    }
  },
  h1 (props) {
    return <h1 style={{textDecoration: 'underline'}}>{props.children}</h1>
  }
})

class NotebookEntryBase extends React.Component {
  onTextareaChange(event) {
    const new_entry_value = event.target.value;
    this.props.updateNotebookEntry(new_entry_value);
  }
  componentDidMount() {
    const found = window.location.pathname.match(/\/notebook\/(\d+)/);
    const entry_id = found[1];
    this.props.fetchNotebookEntry(entry_id);
  }
  render() {
    const entry_name = (this.props.entry && this.props.entry.name !== "") ? this.props.name : "Untitled";
    return (
      <div>
        <div>
          <h3>{entry_name}</h3>
          { (this.props.entry && this.props.entry.created_at && this.props.entry.last_modified) ?
              <p className="muted">
                <i>Created {moment.utc(this.props.entry.created_at).fromNow()}</i>,
                <i> editted {moment.utc(this.props.entry.last_modified).fromNow()}</i>
              </p>
            : null
          }
        </div>
        <div style={{
          height: "80vh",
          borderBottom: '1px solid #DADADA',
          borderTop: '1px solid #DADADA'
        }}>
          <div style={{
            width: "50%",
            float: "left"
          }}>
            <textarea
              style={{
                width: "100%",
                border: "none",
                borderRight: '1px solid #DADADA',
                outline: 'none',
                padding: "16px",
                height: "100%",
                fontFamily: "monospace"
              }}
              onChange={(event) => this.onTextareaChange(event)}
              value={this.props.entry === null ?
                  ""
                : this.props.entry.text}
            ></textarea>
          </div>
          <div style={{
              width: '50%',
              float: "left",
              verticalAlign: 'top',
              display: 'inline-block',
              "overflow-y": "scroll",
              height: "100%"
            }}>
              <div style={{padding: "16px"}}>
                {this.props.entry === null ?
                    null
                  : compile(this.props.entry.text).tree}
              </div>
          </div>
        </div>
      </div>
    );
  }
}
NotebookEntryBase.propTypes = {
  entry: PropTypes.any,
  fetchNotebookEntry: PropTypes.func.isRequired
};

const NotebookEntry = connect(
  mapStateToProps,
  mapDispatchToProps
)(NotebookEntryBase)

export default NotebookEntry
