import React, { Component } from 'react'
import { withNamespaces } from 'react-i18next'

import PickPackGame from "../containers/KPickPackGame";

import "./style/index.scss"


class PickPackApp extends Component {

    render() {

        const {
            playing,
            debug
        } = this.props;

        return (
            <div>
                {playing ? <PickPackGame/> : this.renderIntroScreen()}
            </div>
        );
    }

    renderIntroScreen = () => {
        return (
            <div>
                <div className={"grid-x"}>
                    <div className={"cell auto"}>
                    </div>
                    <div className={"cell small-11 medium-7 large-5 xlarge-4 game-map-outer"}>
                        <button type={"primary"} onClick={this.props.actions.startGame}>Start</button>
                    </div>
                    <div className={"cell auto"}>
                    </div>
                </div>
            </div>
        );
    };

}


export default withNamespaces("pickpack")(PickPackApp)
