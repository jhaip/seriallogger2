import React from 'react'
import PropTypes from 'prop-types'
import marksy from 'marksy/components'
import moment from 'moment'
import { connect } from 'react-redux'
import {
  fetchNotebookEntry,
  updateNotebookEntry
} from '../../actions/NotebookActions'
import NotebookEmbed from './NotebookEmbed'

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
    updateNotebookEntry: (new_entry_text, new_entry_title) => {
      dispatch(updateNotebookEntry(new_entry_text, new_entry_title))
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
                       end={moment(props.end).toDate()}
                       visualType={props.visualType} />
      )
    },
    InlineEmbed() {
      return (
        <img src="https://origin2.cdn.componentsource.com/sites/default/files/styles/logo_medium/public/images/product_screenshot/componentone/componentone-ultimate/img_485611.png?itok=WgGaoLha"></img>
      )
    }
  },
  elements: {
    h1 (props) {
      return <h1 style={{textDecoration: 'underline'}}>{props.children}</h1>
    },
    code (props) {
      if (props.code) {
        return (
          <code style={{
            backgroundColor: "#EEE",
            display: "block",
            padding: "10px",
            width: "100%",
            borderRadius: "3px"
          }}>
            {props.code}
          </code>
        )
      } else {
        // inline
        return (
          <code style={{
            backgroundColor: "#EEE",
            padding: "1px",
            color: "#A2260A",
            borderRadius: "2px"
          }}>
            {props.children}
          </code>
        )
      }
    }
  }
})

class NotebookEntry extends React.Component {
  constructor(props) {
    super(props);
    this.state = {text: '', title: ''};
    this.handleTitleChange = this.handleTitleChange.bind(this);
    this.onTextareaChange = this.onTextareaChange.bind(this);
  }

  handleTitleChange(event) {
    this.setState({title: event.target.value});
    this.props.updateNotebookEntry(this.state.text, event.target.value);
  }

  onTextareaChange(event) {
    const new_entry_value = event.target.value;
    this.setState({text: new_entry_value});
    this.props.updateNotebookEntry(new_entry_value, this.state.title);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.entry) {
      this.setState({text: nextProps.entry.text, title: nextProps.entry.name});
    }
  }

  componentDidMount() {
    const found = window.location.pathname.match(/\/notebook\/(\d+)/);
    const entry_id = found[1];
    this.props.fetchNotebookEntry(entry_id);
  }

  render() {
    return (
      <div>
        <div>
          <input type="text" value={this.state.title} placeholder="Untitled" onChange={this.handleTitleChange} />
          { (this.props.entry && this.props.entry.created_at && this.props.entry.last_modified) ?
              <p className="muted">
                <i>Created {moment.utc(this.props.entry.created_at).fromNow()}</i>,
                <i> edited {moment.utc(this.props.entry.last_modified).fromNow()}</i>
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
              overflowY: "scroll",
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
NotebookEntry.propTypes = {
  entry: PropTypes.any,
  fetchNotebookEntry: PropTypes.func.isRequired
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(NotebookEntry)
