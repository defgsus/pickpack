import React, { Component } from 'react'
import { withNamespaces } from 'react-i18next'

import MapPainter from "./MapPainter";


let _animation_timeout = null;


class PickPackGame extends Component {

    componentDidMount() {
        this.animationStep();
    }

    componentWillUnmount() {
        if (_animation_timeout) {
            clearTimeout(_animation_timeout);
            _animation_timeout = null;
        }
    }

    animationStep = () => {
        this.props.actions.aiStep();

        if (_animation_timeout) {
            clearTimeout(_animation_timeout);
            _animation_timeout = null;
        }
        if (this.props.playing && !this.props.pause)
            _animation_timeout = setTimeout(this.animationStep, 500);
    };

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (!this.props.playing || this.props.pause) {
            if (_animation_timeout) {
                clearTimeout(_animation_timeout);
                _animation_timeout = null;
            }
        }
    }

    handleKeyDown = (event) => {
        event.preventDefault();
        event.stopPropagation();
        console.log(event.key);

        const {
            playerName,
        } = this.props;

        switch (event.key) {
            case "ArrowUp":
                this.props.actions.movePlayer(playerName, 0, 1);
                break;

            case "ArrowDown":
                this.props.actions.movePlayer(playerName, 0, -1);
                break;

            case "ArrowLeft":
                this.props.actions.movePlayer(playerName, -1, 0);
                break;

            case "ArrowRight":
                this.props.actions.movePlayer(playerName, 1, 0);
                break;
        }
    };

    render() {

        const {
            map,
            players,
            debug
        } = this.props;

        return (
            <div
                onKeyDown={this.handleKeyDown}
                tabIndex={"0"}
            >
                <div className={"grid-x grid-margin-x"}>
                    <div className={"cell auto"}>
                        <button onClick={this.props.actions.aiStep}>K.I.</button>
                        <button onClick={this.props.actions.pauseGame}>Pause</button>
                        <button onClick={this.props.actions.startGame}>NEU</button>
                        <input type="checkbox" checked={debug} onChange={this.props.actions.toggleDebug}/>
                        <br/>
                        {this.renderEventsDebug()}
                    </div>
                    <div className={"cell small-11 medium-8 large-7 xlarge-6 game-map-outer"}>
                        <MapPainter
                            map={map}
                            players={players}
                            debug={debug}
                        />
                    </div>
                    <div className={"cell auto"}>
                        {debug && Object.keys(this.props.players).map(this.renderPlayerDebug)}
                    </div>
                </div>

            </div>
        );
    };

    renderEventsDebug = () => {
        const {
            uiEvents
        } = this.props;
        return (
            <ul>
                {uiEvents.map((event, i) => (
                    <li key={i}>{JSON.stringify(event)}</li>
                ))}
            </ul>
        );
    };

    renderPlayerDebug = (playerName) => {
        const {
            players,
        } = this.props;
        const player = players[playerName];

        return (
            <div key={playerName}>
                <h3>{playerName}</h3>
                <p>pos: {player.position[0]}, {player.position[1]}</p>
                {player.task && <p>task: {JSON.stringify(player.task)}</p>}
                {player.path && <p>path: {JSON.stringify(player.path)}</p>}
            </div>
        );
    };
}


export default withNamespaces("pickpack")(PickPackGame)
