import React, {Component} from 'react'

import * as SRD from "storm-react-diagrams"
import "storm-react-diagrams/src/sass/main.scss"

import "./DiagramWidget.scss"


export default class DiagramWidget extends Component {

    render() {
        return (
            this.props.diagramEngine && (
                <SRD.DiagramWidget
                    className={"k3-srd-diagram"}
                    {...this.props}
                />
            )
        );
    };

}
