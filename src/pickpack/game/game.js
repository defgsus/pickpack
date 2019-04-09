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

    const _log = function() { console.log("GOTO", `(${playerName})`, ...arguments); };

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



function _gotoGoalREUSE(map, playerName, goalNode) {

    const _log = function() { console.log("GOTO", `(${playerName})`, ...arguments); };

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
    //console.log("PLAYER pos", player.position, "closest-node", startNode);
    //console.log("WAYPOINTS", map.waypoints()._ids);

    let pathValid = false;
    let nextPos = null;

    // has a current path?
    if (player.path && player.path.length) {
        const pathIndex = player.path.indexOf(curPosId);

        // we are on current path ?
        if (pathIndex >= 0 && pathIndex < player.path.length-1) {
            pathValid = true;

            // see if still points to goal
            if (player.path[player.path.length-1] !== goalNode) {
                pathValid = false;
                _log("goalnode changed")
            }

            if (pathValid) {
                // see if path is still free
                for (let i = pathIndex; i < player.path.length - 1; ++i) {
                    const pathPos = map.waypoints().idToPos(player.path[i]);
                    const field = map.field(pathPos[0], pathPos[1]);
                    if (!(curPosId === player.path[i] || (field.movable && _canFollowPath(map, playerName)))) {
                        _log("path blocked ", i, player.path[i], "by", field);
                        pathValid = false;
                        break;
                    }
                }
            }

            if (pathValid) {
                nextPos = map.waypoints().idToPos(player.path[pathIndex + 1]);
                _log("next step", nextPos);
            }
        }
    }

    if (!pathValid) {
        let path = map.astar().search(startNode, goalNode);
        if (path && path.length < 2)
            path = null;
        _log("new path from", startNode, "to", goalNode, "->", path);
        map.updatePlayer(playerName, {path: path});
        if (path)
            nextPos = map.waypoints().idToPos(path[1]);
    }

    if (nextPos) {
        map.performMove(
            playerName,
            Math.max(-1,Math.min(1, nextPos[0] - player.position[0] )),
            Math.max(-1,Math.min(1, nextPos[1] - player.position[1] ))
        );
    }

    const nextPosId = map.waypoints().posToId(map.players[playerName]);
    if (nextPosId === goalNode) {
        _log("goal reached, clear path");
        map.updatePlayer(playerName, {path: null});
        return true;
    }
    return false;
}


function _canFollowPath(map, playerName) {
    map = map.copy();
    const player = map.players[playerName];
    let curPosId = map.waypoints().posToId(player.position);
    let pathIndex = player.path.indexOf(curPosId);
    if (pathIndex < 0)
        return false;
    while (pathIndex < player.path.length-2) {
        const
            nextPosId = player.path[pathIndex+1],
            pos1 = map.waypoints().idToPos(curPosId),
            pos2 = map.waypoints().idToPos(nextPosId);
        if (!map.performMove(playerName, pos2[0]-pos1[0], pos2[1]-pos1[1]))
            return false;
        pathIndex += 1;
        curPosId = nextPosId;
    }
    return true;
}


export {
    gameAiStep,
    processEvents,
}