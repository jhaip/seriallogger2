import React from 'react'
import PropTypes from 'prop-types'
import moment from 'moment'
import {
  VictoryChart,
  VictoryBrushContainer,
  VictoryAxis,
  VictoryScatter
} from 'victory';


class DataViewGlobalTimeline extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      'selectedDomain': null,

    };
    this.handleBrush = this.handleBrush.bind(this);
    this.changeRange = this.changeRange.bind(this);
  }
  handleBrush(domain) {
    this.setState({selectedDomain: domain});
  }
  changeRange() {
    this.props.changeTime(this.state.selectedDomain.x[0],
                          this.state.selectedDomain.x[1]);
  }
  render() {
    const data = this.props.data.map(d => ({x: d.timestamp, y: 0}));
    return (
      <div className="selected-view__global-timeline">
        <div>
          <div>
            <VictoryChart
              height={100}
              padding={0}
              domain={{x: [this.props.start, this.props.stop]}}
              containerComponent={
                <VictoryBrushContainer responsive={false}
                  brushDimension="x"
                  brushDomain={this.state.selectedDomain}
                  onBrushDomainChange={this.handleBrush}
                />
              }
            >
              <VictoryScatter
                style={{ data: { fill: "#c43a31" } }}
                size={7}
                data={data}
              />
              <VictoryAxis
                scale="time"
                standalone={false}
              />
            </VictoryChart>
          </div>
          {this.state.selectedDomain !== null &&
           this.state.selectedDomain.x[0] != this.props.start &&
           this.state.selectedDomain.x[1] != this.props.stop && (
            <div style={{marginTop: '20px'}}>
              <h4>Selected Range:</h4>
              <p>
                <i>
                  {moment.utc(this.state.selectedDomain.x[0]).toISOString()}
                </i>
                {" - "}
                <i>
                  {moment.utc(this.state.selectedDomain.x[1]).toISOString()}
                </i>
              </p>
              <button
                type="button"
                className="btn btn-primary"
                onClick={ this.changeRange }
              >
                {"Use this range"}
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }
}
DataViewGlobalTimeline.propTypes = {
  data: PropTypes.array,
  activeAnnotation: PropTypes.string.isRequired,
  start: PropTypes.instanceOf(Date).isRequired,
  stop: PropTypes.instanceOf(Date).isRequired,
  changeTime: PropTypes.func.isRequired
};

export default DataViewGlobalTimeline
