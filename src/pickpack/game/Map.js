import WayPoints from "./WayPoints"
import AStar from "./AStar"


export function deepCopy(obj) {
    return JSON.parse(JSON.stringify(obj));
}


export default class Map {
    constructor(state) {
        this.map = {
            ...state.map,
            rows: [...state.map.rows.map(row => [...row])],
        };
        this.players = state.players;
        this.events = state.events;
        this.uiEvents = state.uiEvents;
        this._waypoints = null;
        this._astar = null;
    }

    /** Return object with state for the store */
    nextState = () => ({
        map: this.map,
        players: this.players,
        events: this.events,
        uiEvents: this.uiEvents,
    });

    /** Deepcopy */
    copy = () => {
        const m = new Map({
            map: deepCopy(this.map),
            players: deepCopy(this.players),
            events: deepCopy(this.events),
            uiEvents: deepCopy(this.uiEvents),
        });
        m._waypoints = this.waypoints();
        return m;
    };

    waypoints = () => {
        if (!this._waypoints) {
            this._waypoints = new WayPoints();
            this._waypoints.getMapWaypoints(this.map);
        }
        return this._waypoints;
    };

    astar = () => {
        if (!this._astar) {
            this._astar = new AStar(this.waypoints());
        }
        return this._astar;
    };

    field = (x, y) => {
        return this.map.rows[y][x];
    };

    moveField = (oldX, oldY, newX, newY) => {
        const field = this.map.rows[oldY][oldX];
        this.map.rows[newY][newX] = field;
        this.map.rows[oldY][oldX] = {"type": "empty"};

        if (field.type === "player") {
            this.updatePlayer(field.playerName, {
                position: [newX, newY],
            });
        }
    };

    updatePlayer = (playerName, values) => {
        this.players = {
            ...this.players,
            [playerName]: {
                ...this.players[playerName],
                ...values,
            }
        };
    };

    addEvent(event) {
        this.events = [...this.events];
        this.events.push(event);
    }

    addUiEvent(type, value) {
        const valueJson = JSON.stringify(value);
        const idx = this.uiEvents.findIndex(e => (
            type === e.type && valueJson === JSON.stringify(e.value)
        ));
        if (idx < 0) {
            this.uiEvents = [...this.uiEvents];
            this.uiEvents.push({type, value});
        }
    }

    inRange = (x, y) => (
        x >= 0 && x < this.map.width && y >= 0 && y < this.map.height
    );

    /** Perform a move for a player on map.
     * @param playerName: name of player
     * @param offsetX: -1|0|1
     * @param offsetY: -1|0|1
     */
    performMove = (playerName, offsetX, offsetY) => {
        if (!this.players[playerName])
            throw Error(`Unknown player '${playerName}'`);

        if (!offsetX && !offsetY)
            return;

        const
            player = this.players[playerName],
            oldX = player.position[0],
            oldY = player.position[1],
            newX = oldX + offsetX,
            newY = oldY + offsetY,
            newField = this.field(newX, newY);

        if (this.inRange(newX, newY)) {
            if (newField.type === "empty") {
                this.moveField(oldX, oldY, newX, newY);
                return true;
            }

            // push movables around
            else if (newField.movable) {
                const movables = [[oldX, oldY]];
                let tmpX = newX, tmpY = newY;
                while (this.inRange(tmpX, tmpY) && this.field(tmpX, tmpY).movable) {
                    movables.push([tmpX, tmpY]);
                    tmpX += offsetX;
                    tmpY += offsetY;
                }
                if (this.inRange(tmpX, tmpY)) {
                    if (this.field(tmpX, tmpY).type === "empty") {
                        movables.push([tmpX, tmpY]);
                        for (let i = movables.length - 1; i > 0; --i) {
                            this.moveField(movables[i - 1][0], movables[i - 1][1], movables[i][0], movables[i][1]);
                        }
                        return true;
                    }
                }
            }

            // touch player
            else if (newField.type === "player") {
                this.addEvent({
                    "type": "touch",
                    "from": playerName,
                    "playerName": newField.playerName,
                })
            }
        }
        return false;
    };
}
