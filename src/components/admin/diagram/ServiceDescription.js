import * as SRD from "storm-react-diagrams"
import {deepCopy} from "../../../utils/objects";


export default class ServiceDescription {

    constructor(description) {
        this.description = null;
        this.services = null;
        this.units = null;
        this.onServiceClick = null;
        this._engine = null;
        this._serviceObjects = null;
        this._disabledObjects = null;
        this.setDescription(description);
    }

    setDescription(description) {
        // validation
        for (const serviceName in description.services) {
            const service = description.services[serviceName];
            if (!service.in)
                throw `service '${serviceName}.in' is required`;
        }

        this.description = description;
        this.services = description.services;
        this.units = description.units;
        this._serviceObjects = null;
        this._engine = null;
        this._nodes = null;
    }

    toJson() {
        return JSON.stringify(this.description, null, 2);
    }

    /**
    [{object: "str", state: "str", name: "str", numIn: int, numOut: int}]
    */
    getServiceObjects() {
        if (!this._serviceObjects) {
            const objs = {};

            function _addObject(objectName, isIn) {
                const objectState = objectName.split(".");
                if (!objs[objectName])
                    objs[objectName] = {
                        name: objectName,
                        object: objectState[0],
                        state: objectState[1],
                        numIn: isIn ? 1 : 0,
                        numOut: isIn ? 0 : 1,
                    };
                else {
                    if (isIn)
                        objs[objectName].numIn += 1;
                    else
                        objs[objectName].numOut += 1;
                }
            }

            for (const serviceName in this.services) {
                const service = this.services[serviceName];
                _addObject(service.in, true);
                for (const j in service.out)
                    _addObject(service.out[j], false);
            }

            this._serviceObjects = Object.keys(objs).map(key => objs[key]);
        }

        return this._serviceObjects;
    }

    getDiagramEngine({disabledObjects}) {
        let recreate = disabledObjects !== this._disabledObjects;

        this._disabledObjects = disabledObjects;

        if (!this._engine) {
            this._engine = new SRD.DiagramEngine();
            this._engine.installDefaultFactories();
            recreate = true;
        }

        if (recreate)
            this._engine.setDiagramModel(this._createModel());
        return this._engine;
    }

    /** Returns a description object with all fields that are
      * necessary to reproduce the live diagram
      * @returns {Object}
     */
    getDiagramDescription() {
        if (!this._engine)
            return {};
        const diag = this._engine.diagramModel.serializeDiagram();
        const services = diag.nodes.reduce((a, node) => {
            a[node.name] = {pos: {x: parseInt(node.x), y: parseInt(node.y)}};
            return a;
        }, {});
        return {
            services,
            diagram: {
                offsetX: diag.offsetX,
                offsetY: diag.offsetY,
                zoom: diag.zoom,
            }
        };
    }

    /** Returns new instance of ServiceDescription which is a merge
     * of current and given description.
     * @param description {Object|ServiceDescription}
     * @returns {ServiceDescription}
     */
    getMerged(description) {
        if (description instanceof ServiceDescription)
            description = description.description;
        description = deepCopy(description);

        const mergedDescription = deepCopy(this.description);
        for (const serviceName in description.services) {
            const service = description.services[serviceName];
            mergedDescription.services[serviceName] = {
                ...mergedDescription.services[serviceName],
                ...service
            };
        }

        if (description.diagram) {
            mergedDescription.diagram = {
                ...mergedDescription.diagram,
                ...description.diagram,
            };
        }

        return new ServiceDescription(mergedDescription);
    }

    /** Returns a new ServiceDescription instance where
        the state from the live diagram is merged into the
        description.
     */
    getMergedDiagramState() {
        const diagDescription = this.getDiagramDescription();
        return this.getMerged(diagDescription);
    }

    /** Returns a new ServiceDescription instance where
     * the live-data from k3_heartbeat/latest is merged into.
     * @param heartbeatData {Object}
     * @returns {ServiceDescription}
     */
    getMergedHeartbeatData(heartbeatData) {
        const heartbeatDescription = {
            services: {},
        };
        const rows = heartbeatData.rows;
        for (const i in rows) {
            const row = rows[i];

            let podName = row.node_name.split("-");
            podName = podName.slice(0, podName.length - 2).join("_").slice(8);

            for (const j in row.services) {
                const service = row.services[j];

                if (!heartbeatDescription.services[service.service_name])
                    heartbeatDescription.services[service.service_name] = {};
                const serviceDesc = heartbeatDescription.services[service.service_name];

                serviceDesc.in = service.input_condition.join(".");
                serviceDesc.out = service.output_conditions.map(out => (
                    out ? out.join(".") : null
                )).filter(out => !!out);

                serviceDesc.pod = podName;
            }
        }

        return this.getMerged(heartbeatDescription);
    }

    isDisabledObject(fullName) {
        return this._disabledObjects && this._disabledObjects.has(fullName.split(".")[0]);
    }

    _createModel() {
        const diagramDesc = this.getDiagramDescription();

        diagramDesc.diagram = {
            ...diagramDesc.diagram,
            ...this.description.diagram,
        };

        let model = new SRD.DiagramModel();
        if (diagramDesc.diagram) {
            model.offsetX = diagramDesc.diagram.offsetX;
            model.offsetY = diagramDesc.diagram.offsetY;
            model.zoom = diagramDesc.diagram.zoom;
        }

        this._nodes = {};
        let inPorts = {};

        let xpos = 0;

        for (const serviceName in this.services) {
            const service = this.services[serviceName];

            if (!this._includeService(service))
                continue;

            const node = new SRD.DefaultNodeModel(serviceName, "#a5dea5");
            this._nodes[serviceName] = node;
            node.addListener({
                selectionChanged: this._handleSelectionChange
            });

            if (service.pos) {
                node.setPosition(service.pos.x, service.pos.y);
                xpos = Math.max(xpos, service.pos.x);
            }
            else if (diagramDesc.services[serviceName] && diagramDesc.services[serviceName].pos) {
                const pos = diagramDesc.services[serviceName].pos;
                node.setPosition(pos.x, pos.y);
                xpos = Math.max(xpos, pos.x);
            }
            else
                node.setPosition(xpos, 0);
            xpos += 200;

            const inPort = node.addInPort(service.in);
            if (!inPorts[service.in])
                inPorts[service.in] = [];
            if (!this.isDisabledObject(service.in)) {
                inPorts[service.in].push(inPort);
            }

            model.addAll(node);
        }

        for (const serviceName in this.services) {
            const service = this.services[serviceName];
            const node = this._nodes[serviceName];
            if (!node)
                continue;

            for (const i in service.out) {
                const msg = service.out[i];
                const outPort = node.addOutPort(msg);
                if (inPorts[msg]) {
                    for (const j in inPorts[msg]) {
                        const link = outPort.link(inPorts[msg][j]);
                        link.addLabel(msg);

                        model.addAll(link);
                    }
                }
            }
        }

        return model;
    }

    _includeService(service) {
        if (this._disabledObjects) {
            let count = this.isDisabledObject(service.in) ? 0 : 1;

            for (const out of service.out)
                count += this.isDisabledObject(out) ? 0 : 1;

            if (!count)
                return false;
        }
        return true;
    }

    _handleSelectionChange = (e) => {
        const serviceName = e.entity.name;
        if (this.onServiceClick)
            this.onServiceClick(serviceName);
    };
}