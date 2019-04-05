import React, {Component} from 'react'
import { withNamespaces } from 'react-i18next'
import { Input, Collapse, Alert, Button, Divider } from 'antd'

import DiagramWidget from "./DiagramWidget"
import Protected from "containers/auth/KProtected"
import ServiceDescription from "./ServiceDescription"
import ServiceObjectsTable from "./ServiceObjectsTable"
import ServiceDiagramFilter from "./ServiceDiagramFilter"
import ServiceView from "./ServiceView"

import GLOBAL_DEFINITION from "./global_definition"


const INIT_DESCRIPTION = {
    "services": {
        "service1": {
            "in": "message.NEW",
            "out": [
                "message.PROCESSED",
                "message.FAILED"
            ],
            "pos": {
                "x": -194,
                "y": 180
            }
        },
        "service2": {
            "in": "message.PROCESSED",
            "out": [
                "message.DONE"
            ],
            "pos": {
                "x": 155,
                "y": 46
            }
        },
        "service3": {
            "in": "message.FAILED",
            "out": [
                "message.DONE"
            ],
            "pos": {
                "x": 218,
                "y": 349
            }
        },
        "service4": {
            "in": "message.DONE",
            "out": [],
            "pos": {
                "x": 570,
                "y": 173
            }
        }
    }
};


const NEW_DESCRIPTION_DOC = {
    "services": {
        "service_name": {
            "in": "object.STATE",
            "out": ["objectA.STATE", "objectB.STATE"],  // optional
            "doc": "multi-line description",            // optional but very recommended
            "unit": "unit_with_shared_database",        // optional - partly gathered from live-system
            "pod": "k3_pod",                            // optional - gathered from live-system
            "pos": {"x": 0, "y": 0},                    // optional - from live-edit in frontend
        },
    },
    "units": {
        "unit_name": {
            "rest": [
                {
                    "url": "/abs/path",
                    "method": "PATCH",
                    "permissions": ["bla.blub"],
                    "doc": "multi-line description"
                },
            ],
        }
    },
};


class ServiceDiagramEditor extends Component {

    state = {
        description: null,
        descriptionJson: new ServiceDescription(GLOBAL_DEFINITION).toJson(),
        disabledObjects: null,
    };

    componentDidMount() {
        this.setDescription(this.state.descriptionJson);
        this.props.getLatestHeartbeatData();
    }

    handleDescriptionChange = (e) => {
        e.preventDefault();
        const descriptionJson = e.target.value;
        this.setState({descriptionJson});
        this.setDescription(descriptionJson);
    };

    /**
     * Sets the service description for this component and creates a graph.
     * @param description {string|Object|ServiceDescription}
     */
    setDescription = (description) => {
        if (description instanceof ServiceDescription) {
            description.onServiceClick = this.handleServiceClick;
            this.setState({
                descriptionError: null,
                description: description,
                descriptionJson: description.toJson(),
            });
        }
        else {
            try {
                if (typeof description === "string")
                    description = JSON.parse(description);
                description = new ServiceDescription(description);
                description.onServiceClick = this.handleServiceClick;

                this.setState({
                    descriptionError: null,
                    description: description,
                });
            }
            catch (e) {
                this.setState({descriptionError: `${e}`});
            }
        }
    };

    storeDiagramState = () => {
        if (this.state.description) {
            const newDescription = this.state.description.getMergedDiagramState();
            this.setDescription(newDescription);
        }
    };

    mergeLiveData = () => {
        if (!this.state.description || !this.props.heartbeats.data)
            return;

        this.setDescription(
            this.state.description.getMergedHeartbeatData(this.props.heartbeats.data)
        );
    };

    zoomToFit = () => {
        const engine = this.state.description && this.state.description._engine;
        if (engine)
            engine.zoomToFit();
    };

    setObjectVisible = (objectName, visible) => {
        const disabledObjects = new Set(this.state.disabledObjects || []);
        if (visible)
            disabledObjects.delete(objectName);
        else
            disabledObjects.add(objectName);
        this.setState({disabledObjects});
    };

    handleServiceClick = (serviceName) => {
        this.setState({selectedService: serviceName});
    };

    render() {

        const { t } = this.props;

        const { description, selectedService, disabledObjects } = this.state;

        return (
            <Protected verbose>
                <div className={"grid-x"}>
                    <div className={"cell small-12"}>
                        <div>
                            <Button onClick={this.zoomToFit}>
                                {t("admin.diagram.zoomToFit")}
                            </Button>
                        </div>
                    </div>

                    <div className={"cell small-8"} style={{minHeight: "30rem"}}>
                        {description && this.renderDiagram(description.getDiagramEngine({disabledObjects}))}
                    </div>

                    <div className={"cell small-4"}>
                        <Collapse defaultActiveKey={["service", "filter"]}>
                            <Collapse.Panel key={"service"} header={t("admin.diagram.selectedService")}>
                                {selectedService && <ServiceView
                                    serviceName={selectedService}
                                    description={description}
                                    />
                                }
                            </Collapse.Panel>

                            <Collapse.Panel key={"filter"} header={t("admin.diagram.filter")}>
                                <ServiceDiagramFilter
                                    description={description}
                                    disabledObjects={disabledObjects}
                                    setObjectVisible={this.setObjectVisible}
                                />
                            </Collapse.Panel>

                        </Collapse>
                    </div>
                </div>

                <div>
                    <Button onClick={this.mergeLiveData}>
                        {t("admin.diagram.mergeWithLiveData")}
                    </Button>

                    <Button onClick={this.storeDiagramState}>
                        {t("admin.diagram.storeDiagramInDescription")}
                    </Button>
                </div>

                <Divider/>

                <div className={"grid-x"}>
                    <div className={"cell small-12 medium-4"} style={{paddingRight: "1rem"}}>
                        {this.renderEditor()}
                    </div>
                    <div className={"cell small-12 medium-8"}>
                        <ServiceObjectsTable
                            description={description}
                            disabledObjects={disabledObjects}
                        />
                    </div>
                </div>

            </Protected>
        );
    }

    renderEditor = () => {
        const { t } = this.props;
        const { descriptionJson, descriptionError } = this.state;

        return (
            <div>
                <Input.TextArea
                    rows={20}
                    style={{
                        fontFamily: "monospace"
                    }}
                    value={descriptionJson}
                    onChange={this.handleDescriptionChange}
                />
                {descriptionError && <Alert type={"error"} message={descriptionError}/>}
            </div>
        );
    };

    renderDiagram = (engine) => {
        const { t } = this.props;
        return (
            engine && (
                <DiagramWidget
                    diagramEngine={engine}
                    smartRouting={false}
                    maxNumberPointsPerLink={0}
                />
            )
        );
    };

}


export default withNamespaces()(ServiceDiagramEditor);
