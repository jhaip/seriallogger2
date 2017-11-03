import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import DetailViewText from "./DataViews/Text/DetailViewText"
import DetailViewLineGraph from "./DataViews/LineGraph/DetailViewLineGraph"
import moment from 'moment'
import { fetchDataOrGetCacheData } from '../actions/DataActions'
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
    this.updateData = this.updateData.bind(this);
  }

  updateData(props) {
    this.setState({is_fetching: true});
    // TODO: don't call this function directly, dispatch an action like
    // the overview does
    fetchDataOrGetCacheData(
      props.source,
      props.start,
      props.end,
      props.state
    ).then(data => {
      switch (props.visualType) {
        case "line graph":
          this.setState({data: data, is_fetching: false});
          break;
        case "raw":
        default:
          const data_tree = createAnnotatedSelectedDataTree(data, [], null);
          this.setState({data: data_tree, is_fetching: false});
      }
    });
  }

  componentDidMount() {
    this.updateData(this.props);
  }

  componentWillReceiveProps(nextProps) {
    if (new String(this.props.source).valueOf() !== new String(nextProps.source).valueOf() ||
        new String(this.props.visualType).valueOf() !== new String(nextProps.visualType).valueOf() ||
        !moment(this.props.start).isSame(moment(nextProps.start)) ||
        !moment(this.props.end).isSame(moment(nextProps.end)) ||
        (Object.keys(this.props.state.data).length === 0 && Object.keys(nextProps.state.data).length > 0) ) {
      this.updateData(nextProps);
    }
  }

  renderVisual() {
    switch (this.props.visualType) {
      case "line graph":
        return (
          <DetailViewLineGraph
            data={this.state.data}
            activeAnnotation="" />
        );
        break;
      case "raw":
      default:
        return (
          <DetailViewText data={this.state.data}
                          activeAnnotation="" />
        );
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
      <div className="notebook-embed">
        <div style={{
            backgroundColor: "#88F",
            fontSize: "11px",
            color: "white",
            padding: "3px 10px"
          }}
          >
          <strong>{this.props.source}</strong> from <strong>{moment(this.props.start).fromNow()}</strong> to <strong>{moment(this.props.end).fromNow()}</strong>
        </div>
        <div style={styles}>
          {this.state.is_fetching ?
              <i>Loading</i>
            : this.state.data.length === 0 ? <i>No data</i> : null}
          {this.renderVisual() }
        </div>
      </div>
    );
  }
}
NotebookEmbed.propTypes = {
  source: PropTypes.string.isRequired,
  start: PropTypes.instanceOf(Date).isRequired,
  end: PropTypes.instanceOf(Date).isRequired,
  visualType: PropTypes.string,
  state: PropTypes.object.isRequired
};

export default connect(mapStateToProps, mapDispatchToProps)(NotebookEmbed)
