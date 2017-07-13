import React from 'react'
import PropTypes from 'prop-types'
import LabeledTimeline from "./LabeledTimeline"

class LabeledTimelineList extends React.Component {
    render() {
        const sourceList = this.props.viewLabels.map((label) => {
            return <LabeledTimeline
                key={label}
                label={label}
                viewStartTime={this.props.viewStartTime}
                viewEndTime={this.props.viewEndTime}
                selectionStartTime={this.props.selectionStartTime}
                selectionEndTime={this.props.selectionEndTime}
                onDomainChange={this.props.onDomainChange}
                data={this.props.data[label]}
            />;
        });
        return (
            <div>
                <h2>Sources List</h2>
                <p>Selection Range {moment(this.props.selectionStartTime).fromNow()} - {moment(this.props.selectionEndTime).fromNow()}</p>
                <div>
                    {sourceList}
                </div>
            </div>
        );
    }
}
LabeledTimelineList.propTypes = {
  viewStartTime: PropTypes.instanceOf(Date).isRequired,
  viewEndTime: PropTypes.instanceOf(Date).isRequired,
  viewLabels: PropTypes.arrayOf(PropTypes.string).isRequired,
  selectionStartTime: PropTypes.instanceOf(Date).isRequired,
  selectionEndTime: PropTypes.instanceOf(Date).isRequired,
  onDomainChange: PropTypes.func.isRequired,
  data: PropTypes.object
};

export default LabeledTimelineList
