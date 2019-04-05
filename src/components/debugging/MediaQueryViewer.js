import React, {Component} from 'react'

import { Layout } from 'antd'
import 'scss/visibility.scss'


export default class MediaQueryViewer extends Component {

    render() {
        return (
        <div>
            <span style={{marginRight: "1em", fontWeight: "bold",}}>Media Queries</span>
            <span style={{marginRight: "1em",}} className="show-for-small">small</span>
            <span style={{marginRight: "1em",}} className="show-for-medium">medium</span>
            <span style={{marginRight: "1em",}} className="show-for-large">large</span>
            <span style={{marginRight: "1em",}} className="show-for-xlarge">xlarge</span>
            <span style={{marginRight: "1em",}} className="show-for-xxlarge">xxlarge</span>
        </div>
        );
    }
}
