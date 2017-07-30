import React from 'react'
import PropTypes from 'prop-types'
import marksy from 'marksy/components'
import { connect } from 'react-redux'
import {
  fetchNotebookEntry,
  updateNotebookEntry
} from '../actions/NotebookActions'

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
    Embed () {
      return (
        <img src="http://d.stockcharts.com/school/data/media/chart_school/overview/images/charts-3sunw-c.png"></img>
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

const demo = `
# Some blog title

Just need to show you some code first:

\`\`\`js
const foo = "bar"
\`\`\`

<Row>
  <Col>Need to tell you something over here</Col>
  <Col>And over here</Col>
</Row>

This is a test of inline code:

<p>
Today I saw a blind women. The growth has been dramatic
<InlineEmbed></InlineEmbed>
 and I'm happy about that.
</p>

More tests

Look at this cool graph:

<Embed></Embed>

nice
`

class NotebookEntryBase extends React.Component {
  onTextareaChange(event) {
    const new_entry_value = event.target.value;
    this.props.updateNotebookEntry(new_entry_value);
  }
  componentWillMount() {
    const found = window.location.pathname.match(/\/notebook\/(\d+)/);
    const entry_id = found[1];
    this.props.fetchNotebookEntry(entry_id);
  }
  render() {
    return (
      <div>
        <div style={{
            width: '50%',
            verticalAlign: 'top',
            display: 'inline-block',
            padding: '0 20px'
          }}>
            {this.props.entry === null ?
                null
              : compile(this.props.entry.text).tree}
        </div>
        <textarea
          style={{
            width: "45%",
            height: 500,
            border: '1px dashed #DADADA',
            outline: 'none',
            padding: '10px'
          }}
          onChange={(event) => this.onTextareaChange(event)}
          value={this.props.entry === null ?
              ""
            : this.props.entry.text}
        ></textarea>
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
