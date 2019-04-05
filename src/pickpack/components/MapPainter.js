import React, {Component} from 'react'
import { withNamespaces } from 'react-i18next'

import { Input, Button, Menu, Dropdown } from 'antd'

import "./style/map.scss"


class MapPainter extends Component {

    render() {

        const {
            map,
            players,
        } = this.props;

        return (
            <div
                className={"game-map-inner"}
                style={{
                    padding: `0 0 ${Math.round(map.height/map.width*100)}% 0`
                }}
            >
                <div className={"grid-y game-map"}>
                    {map.rows.map((_, y) => (
                        <div className={"cell auto"} key={y}>
                            <div className={"grid-x"}>
                                {map.rows[map.height-1-parseInt(y)].map((cell, x) => (
                                    this.renderCell(cell, x, map.height-1-parseInt(y))
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    renderCell = (cell, x, y) => {
        const nodeId = `${x},${y}`;
        let text = cell.type;
        if (cell.type === "player")
            text = cell.name;

        let isPath = false;
        if (this.props.debug && this.props.players) {
            for (const playerName in this.props.players) {
                const p = this.props.players[playerName];
                if (p.path) {
                    if (p.path.indexOf(nodeId) >= 0) {
                        isPath = true;
                        break;
                    }
                }
            }
        }
        return (
            <div className={"cell auto game-cell game-type-" + cell.type + (isPath ? " path" : "")} key={x}>
                {this.props.debug && `${x},${y}`}
            </div>
        );
    };

}


export default withNamespaces()(MapPainter)
