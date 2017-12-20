import React from 'react'
import PropTypes from 'prop-types'
import {
  VictoryChart,
  VictoryLine,
  VictoryLegend,
  VictoryAxis
} from 'victory';


class DataViewLineGraph extends React.Component {
  render() {
    let groups = {
      "default": []
    };
    for (let d of this.props.data) {
      const numberValue = parseFloat(d.value);
      if (isNaN(numberValue)) {
        try {
          const jsonData = JSON.parse(d.value);
          Object.keys(jsonData).forEach(key => {
            groups[key] = groups[key] || [];
            groups[key].push({
              timestamp: d.timestamp,
              value: jsonData[key]
            });
          })
        } catch (e) {
          console.log("error parsing JSON");
          console.error(e);
        }
      } else {
        groups["default"].push({
          timestamp: d.timestamp,
          value: numberValue
        });
      }
    }
    console.log("CHART DATA:");
    console.log(groups);

    const colors = ["red", "green", "blue", "orange", "black"];
    const list = Object.keys(groups).map((groupKey, i) => {
      if (groups[groupKey].length === 0) { return null; }
      return (
        <VictoryLine
          data={groups[groupKey]}
          x="timestamp"
          y="value"
          style={{
            data: { stroke: colors[i] }
          }}
        />
      )
    });
    const legend = (Object.keys(groups).length > 1) && (
      <VictoryLegend
        centerTitle
        orientation="horizontal"
        colorScale={colors}
        data={Object.keys(groups).map(key => {
          return {'name': key}
        })}
      />
    );

    return (
      <div className="selected-view__data-line-graph">
        <VictoryChart
          >
          { legend }
          { list }
          <VictoryAxis
            scale="time"
            standalone={false}
          />
        </VictoryChart>
      </div>
    );
  }
}
DataViewLineGraph.propTypes = {
  data: PropTypes.array,
  activeAnnotation: PropTypes.string.isRequired,
};

export default DataViewLineGraph
