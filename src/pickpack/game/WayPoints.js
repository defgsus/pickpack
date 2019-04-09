
export function deepCopy(obj) {
    return JSON.parse(JSON.stringify(obj));
}


export default class WayPoints {

    constructor() {
        this._ids = new Set();
        this._edge_fwd = {};
        this._edge_back = {};
    }

    copy = () => {
        const wp = new WayPoints();
        wp._ids = deepCopy(this._ids);
        wp._edge_fwd = deepCopy(this._edge_fwd);
        wp._edge_back = deepCopy(this._edge_back);
        return wp;
    };

    hasEdge = (id1, id2) => {
        if (this._edge_fwd[id1])
            return !!this._edge_fwd[id1][id2];
        if (this._edge_back[id1])
            return !!this._edge_back[id1][id2];
        return false;
    };

    getDistance = (id1, id2) => {
        if (this._edge_fwd[id1] && this._edge_fwd[id1][id2])
            return this._edge_fwd[id1][id2];
        if (this._edge_back[id1] && this._edge_back[id1][id2])
            return this._edge_back[id1][id2];
        return this._calcDist(id1, id2);
    };

    posToId = (pos) => (`${pos[0]},${pos[1]}`);
    idToPos = (id) => (id.split(",").map(x=>parseInt(x)));

    addEdge = (id1, id2) => {
        if (this.hasEdge(id1, id2))
            return;

        if (!this._edge_fwd[id1])
            this._edge_fwd[id1] = {[id2]: this._calcDist(id1, id2)};
        else
            if (!this._edge_fwd[id1][id2])
                this._edge_fwd[id1][id2] = this._calcDist(id1, id2);

        if (!this._edge_back[id2])
            this._edge_back[id2] = {[id1]: this._calcDist(id2, id1)};
        else
            if (!this._edge_back[id2][id1])
                this._edge_back[id2][id1] = this._calcDist(id2, id1);
    };

    /** Add an edge between two positions (array of length 2) */
    addEdgePos = (pos1, pos2) => {
        // console.log("ADDPOS", pos1, "->", pos2);
        const
            id1 = this._addNodePos(pos1),
            id2 = this._addNodePos(pos2);
        this.addEdge(id1, id2);
    };

    getAdjacentNodes = (node) => {
        const adj = new Set();
        if (this._edge_fwd[node]) {
            for (const n in this._edge_fwd[node])
                adj.add(n);
        }
        if (this._edge_back[node]) {
            for (const n in this._edge_back[node])
                adj.add(n);
        }
        return adj
    };

    getClosestNode = (pos) => {
        const id = this.posToId(pos);
        if (this._ids.has(id))
            return id;

        let
            minDist = 10000000,
            closestId = null;
        for (const otherId of this._ids) {
            const
                otherPos = this.idToPos(otherId),
                dx = otherPos[0] - pos[0],
                dy = otherPos[1] - pos[1],
                dist = dx*dx + dy*dy;
            if (dist < minDist) {
                minDist = dist;
                closestId = otherId;
            }
        }
        return closestId;
    };

    getMapWaypoints_FLOODFILL = (map) => {

        let startPos = null;
        while (!startPos || map.rows[startPos[1]][startPos[0]].type !== "empty") {
            startPos = [
                parseInt(Math.random() * map.width) % map.width,
                parseInt(Math.random() * map.height) % map.height,
            ]
        }

        const visited = new Set();
        const visit = new Set([this.posToId(startPos)]);
        const addEdgePos = this.addEdgePos;
        const posToId = this.posToId;

        while (visit.size) {
            const cur = visit.entries().next().value[0];
            visit.delete(cur);
            const curPos = this.idToPos(cur);

            const _add = function(x, y) {
                addEdgePos(curPos, [x, y]);
                const newId = posToId([x, y]);
                if (map.rows[y][x].type === "empty")
                    if (!visited.has(newId))
                        visit.add(newId);
            };

            const _check = function(x, y) {
                if (x >= 0 && x < map.width && y >= 0 && y < map.height) {
                    const field = map.rows[y][x];
                    if (field.type === "empty" || field.type === "player" || field.movable)
                        _add(x, y);
                }
            };

            _check(curPos[0]-1, curPos[1]);
            _check(curPos[0]+1, curPos[1]);
            _check(curPos[0], curPos[1]+1);
            _check(curPos[0], curPos[1]-1);

            visited.add(cur);
        }
    };

    getMapWaypoints = (map) => {

        const addEdgePos = this.addEdgePos;
        const posToId = this.posToId;

        for (let y=0; y<map.height-1; ++y) {
            for (let x=0; x<map.width-1; ++x) {

                const field = map.rows[y][x];
                if (!(field.type === "empty" || field.type === "player" || field.movable))
                    continue;

                const curPos = [x, y];

                const _check = function (x, y) {
                    if (x >= 0 && x < map.width && y >= 0 && y < map.height) {
                        const field = map.rows[y][x];
                        if (field.type === "empty" || field.type === "player" || field.movable)
                            addEdgePos(curPos, [x, y]);
                    }
                };

                _check(curPos[0] + 1, curPos[1]);
                _check(curPos[0], curPos[1] + 1);
            }
        }
    };

    _addNodePos = (pos) => {
        const id = this.posToId(pos);
        if (this._ids.has(id))
            return id;

        this._ids.add(id);
        return id;
    };

    _calcDist = (id1, id2) => {
        const
            pos1 = this.idToPos(id1),
            pos2 = this.idToPos(id2),
            dx = pos2[0] - pos1[0],
            dy = pos2[1] - pos1[1];
        return Math.sqrt(dx*dx+dy*dy);
    };
}