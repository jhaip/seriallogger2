import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import DetailViewText from './DetailViewText'
import moment from 'moment'
import { fetchDetailDataPurely } from '../actions/DetailActions'
import { createAnnotatedSelectedDataTree } from '../selectors/index'

const mapStateToProps = state => {
  return {
    state
  }
}

const mapDispatchToProps = null;

class NotebookEmbed extends React.Component {
  constructor(props) {
    super(props);
    this.state = {data: [], is_fetching: false}
  }

  update(props) {
    console.log("UPDATING NOTEBOOK EMBED!");
    this.setState({is_fetching: true});
    // TODO: don't call this function directly, dispatch an action like
    // the overview does
    fetchDetailDataPurely(
      props.source,
      props.start,
      props.end,
      this.props.state
    ).then(data => {
      const data_tree = createAnnotatedSelectedDataTree(data, [], null);
      this.setState({data: data_tree, is_fetching: false});
    });
  }

  componentDidMount() {
    this.update(this.props);
  }

  componentWillReceiveProps(nextProps) {
    if (new String(this.props.source).valueOf() !== new String(nextProps.source).valueOf() ||
        !moment(this.props.start).isSame(moment(nextProps.start)) ||
        !moment(this.props.end).isSame(moment(nextProps.end)) ) {
      this.update(nextProps);
    }
  }

  render() {
    const styles = {
      border: "1px solid #88F",
      padding: "10px",
      overflow: "scroll",
      maxHeight: "200px"
    }
    return (
      <div>
        <div style={{
            backgroundColor: "#88F",
            fontSize: "11px",
            color: "white",
            padding: "3px 10px"
          }}>
          <strong>{this.props.source}</strong> from <strong>{moment(this.props.start).fromNow()}</strong> to <strong>{moment(this.props.end).fromNow()}</strong>
        </div>
        <div style={styles}>
          {this.state.is_fetching ?
              <i>Loading</i>
            : this.state.data.length === 0 ? <i>No data</i> : null}
          <DetailViewText data={this.state.data} activeAnnotation="" />
        </div>
      </div>
    );
  }
}
NotebookEmbed.propTypes = {
  source: PropTypes.string.isRequired,
  start: PropTypes.instanceOf(Date).isRequired,
  end: PropTypes.instanceOf(Date).isRequired,
  state: PropTypes.object.isRequired
};

export default connect(mapStateToProps, mapDispatchToProps)(NotebookEmbed)
