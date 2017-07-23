import React from 'react'
import PropTypes from 'prop-types'
import moment from 'moment'
import { VictoryScatter, VictoryChart, VictoryTheme, VictoryAxis, VictoryBrushContainer } from 'victory';

class LabeledTimeline extends React.Component {
  render() {
    return (
      <div>
        <strong>{this.props.label}</strong>
        <div>
          <VictoryChart
            padding={{top: 0, left: 20, right: 20, bottom: 30}}
            width={900}
            height={60}
            domain={{y: [0,1]}}
            domainPadding={{x: 30}}
            scale={{x: "time"}}
            containerComponent={
              <VictoryBrushContainer responsive={false}
                dimension="x"
                onDomainChange={this.props.onDomainChange}
                selectedDomain={{x: [this.props.selectionStartTime, this.props.selectionEndTime]}}
              />
            }
          >
            <VictoryAxis
              tickFormat={(x) => moment(x).format('h:mm:ss')}
              style={{
                ticks: {stroke: "grey", size: 5},
              }}
              domain={{x: [this.props.viewStartTime, this.props.viewEndTime]}}
            />
            <VictoryScatter
              data={this.props.data}
              x={(datum) => new Date(datum.timestamp)}
              y={(datum) => 0}
            />
          </VictoryChart>
        </div>
      </div>
    );
  }
}
LabeledTimeline.propTypes = {
  label: PropTypes.string.isRequired,
  viewStartTime: PropTypes.instanceOf(Date).isRequired,
  viewEndTime: PropTypes.instanceOf(Date).isRequired,
  selectionStartTime: PropTypes.instanceOf(Date).isRequired,
  selectionEndTime: PropTypes.instanceOf(Date).isRequired,
  onDomainChange: PropTypes.func.isRequired,
  data: PropTypes.array
};

export default LabeledTimeline
