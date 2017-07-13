import React from 'react'
import PropTypes from 'prop-types'
import ViewRangeSelection from "../containers/ViewRangeSelection"
import SourcesOverview from "../containers/SourcesOverview"

class OverviewBlock extends React.Component {
    render() {
        return (
            <div>
                <ViewRangeSelection />
                <SourcesOverview />
            </div>
        );
    }
}

export default OverviewBlock
