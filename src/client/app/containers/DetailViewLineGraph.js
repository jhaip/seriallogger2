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
    const cleanData = this.props.data.reduce((acc, d) => {
      // console.log(d);
      const re = / (\d\d.\d\d)\*F/g;
      var s = d.value.slice(0);
      var m;
      var matches = [];
      do {
          m = re.exec(s);
          if (m) {
            matches.push(+m[1]);
          }
      } while (m);

      return acc.concat(matches);
    }, []);
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
