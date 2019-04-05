import React, { Component } from 'react'


export default class NoWrap extends Component {

    render() {
        const { style } = this.props;

        return <span {...this.props} style={{whiteSpace: "nowrap", ...style}} />;
    }
}
