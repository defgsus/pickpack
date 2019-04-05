import WayPoints from "./WayPoints"
import AStar from "./AStar"


const
    _ = {"type": "empty"},
    W = {"type": "wall"},
    C = {"type": "chest", "movable": true},
    S = {"type": "shelf", "shelfName": "A1"};


const DEFAULT_MAP = {
    width: 14,
    height: 11,
    rows: [
        [W, W, W, W, W, W, W, W, W, W, W, W, W, W],
        [W, _, _, _, _, _, _, _, C, _, _, _, _, W],
        [W, _, _, _, _, _, _, _, _, _, _, _, _, W],
        [W, _, C, _, S, S, S, S, S, _, C, S, _, W],
        [W, _, _, _, _, _, C, _, _, _, C, S, _, W],
        [W, _, C, C, S, S, S, S, S, _, _, S, _, W],
        [W, _, _, _, _, _, _, _, _, C, _, S, _, W],
        [W, _, _, _, _, C, _, _, _, _, _, S, _, W],
        [W, _, _, _, _, _, _, _, _, _, _, C, _, W],
        [W, _, _, _, _, _, _, _, _, _, _, _, _, W],
        [W, W, W, W, W, W, W, W, W, W, W, W, W, W],
    ]
};


const DEFAULT_PLAYERS = {
    "Pick": {
        "position": [1, 1],
    },
    "Pack": {
        "position": [12, 7],
        "task": {
            type: "goto",
            playerName: "Pick",
        }
    },
    "Puck": {
        "position": [7, 5],
        "task": {
            type: "goto",
            playerName: "Pack",
        }
    },
};


export function deepCopy(obj) {
    return JSON.parse(JSON.stringify(obj));
}


function createNewGameState() {
    const map = deepCopy(DEFAULT_MAP);
    const players = deepCopy(DEFAULT_PLAYERS);

    for (const playerName in players) {
        const player = players[playerName];
        map.rows[player.position[1]][player.position[0]] = {
            type: "player",
            playerName: playerName,
        }
    }

    return {
        map,
        players,
        playerName: "Pick",
        events: [],
        uiEvents: [],
    }
}


/**
 * Perform game logic
 * @param map instance of Map(map, players)
 */
function gameAiStep(map) {
    for (const playerName in map.players) {
        const player = map.players[playerName];
        if (player.task) {
            switch (player.task.type) {

                case "goto": {

                    // go to other player
                    if (player.task.playerName) {
                        const otherPlayer = map.players[player.task.playerName];
                        const goalNode = map.waypoints().getClosestNode(otherPlayer.position);
                        _gotoGoal(map, playerName, goalNode);
                    }
                }
                break;
            }
        }
    }
}

/** Process map.events and convert to map.uiEvents if appropriate.
 *  Clears map.events at the end.
 */
function processEvents(map) {
    for (const event of map.events) {
        if (event.type === "touch") {
            if (event.from === "Pack" && event.playerName === "Pick")
                map.addUiEvent("message", "Pack hat Dich!");
        }
    }

    map.events = [];
}


function _gotoGoal(map, playerName, goalNode) {
    const player = map.players[playerName];

    const startNode = map.waypoints().getClosestNode(player.position);
    //console.log("PLAYER pos", player.position, "closest-node", startNode);
    //console.log("WAYPOINTS", map.waypoints()._ids);

    let nextPos = null;
    if (!player.path || player.path[player.path.length-1] !== goalNode) {
        const path = map.astar().search(startNode, goalNode);
        map.updatePlayer(playerName, {
            path: path,
        });
        if (path)
            nextPos = map.waypoints().idToPos(path[0]);
    }

    if (player.path && player.path.length) {
        const curPosId = map.waypoints().posToId(player.position);
        const pathIndex = player.path.indexOf(curPosId);
        if (pathIndex >= 0 && pathIndex < player.path.length-1) {
            nextPos = map.waypoints().idToPos(player.path[pathIndex+1]);
        }
        else {
            const path = map.astar().search(startNode, goalNode);
            map.updatePlayer(playerName, {path: path});
            if (path)
                nextPos = map.waypoints().idToPos(path[0]);
        }
    }

    if (nextPos) {
        map.performMove(
            playerName,
            nextPos[0] - player.position[0],
            nextPos[1] - player.position[1]
        );
    }
}


export {
    createNewGameState,
    gameAiStep,
    processEvents,
}