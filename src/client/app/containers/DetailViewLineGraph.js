import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { VictoryChart, VictoryTheme, VictoryLine } from 'victory';

const mapStateToProps = state => {
  return {
    data: state.selected.data,
    activeAnnotation: state.selected.activeAnnotation
  }
}

const mapDispatchToProps = null;


class DetailViewLineGraph extends React.Component {
  render() {
    const cleanData = this.props.data.map(d => {
      return d;
    });
    console.log(cleanData);
    return (
      <div id="selected-view__data-line-graph">
        <VictoryChart
          theme={VictoryTheme.material}
          width={600}
          height={300}
          >
          <VictoryLine
            data={cleanData}
            x="timestamp"
            y="value"
          />
        </VictoryChart>
      </div>
    );
  }
}
DetailViewLineGraph.propTypes = {
  data: PropTypes.array,
  activeAnnotation: PropTypes.string.isRequired,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(DetailViewLineGraph)
