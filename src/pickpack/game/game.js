import WayPoints from "./WayPoints"
import AStar from "./AStar"


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

    //const _log = function() { console.log("GOTO", `(${playerName})`, ...arguments); };
    const _log = ()=>null;

    const player = map.players[playerName];
    const curPosId = map.waypoints().posToId(player.position);

    if (curPosId === goalNode) {
        if (player.path) {
            _log("goal reached, clear path");
            map.updatePlayer(playerName, {path: null});
        }
        return true;
    }

    const startNode = map.waypoints().getClosestNode(player.position);
    if (startNode !== curPosId) {
        _log("CANT FIND startNode", player.position, startNode, map.waypoints()._ids);
        return false;
    }
    //console.log("PLAYER pos", player.position, "closest-node", startNode);
    //console.log("WAYPOINTS", map.waypoints()._ids);

    let path = map.astar().search(startNode, goalNode);
    if (path && path.length < 2)
        path = null;
    _log("search", curPosId, startNode, goalNode, path);
    map.updatePlayer(playerName, {path});
    if (path) {
        const nextPos = map.waypoints().idToPos(path[1]);
        map.performMove(
            playerName,
            Math.max(-1,Math.min(1, nextPos[0] - player.position[0] )),
            Math.max(-1,Math.min(1, nextPos[1] - player.position[1] ))
        );
        const nextPosId = map.waypoints().posToId(map.players[playerName]);
        return nextPosId === goalNode;
    }
    return false;
}


export {
    gameAiStep,
    processEvents,
}