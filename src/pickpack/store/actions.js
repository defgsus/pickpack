const ACTIONS = {
    START_GAME: "pickpack/START_GAME",
    PAUSE_GAME: "pickpack/PAUSE_GAME",
    TOGGLE_DEBUG: "pickpack/TOGGLE_DEBUG",
    AI_STEP: "pickpack/AI_STEP",
    MOVE_PLAYER: "pickpack/MOVE_PLAYER",
};

export default ACTIONS


function startGame() {
    return {
        type: ACTIONS.START_GAME,
    };
}

function pauseGame() {
    return {
        type: ACTIONS.PAUSE_GAME,
    };
}

function toggleDebug() {
    return {
        type: ACTIONS.TOGGLE_DEBUG,
    };
}

function makeAiStep() {
    return {
        type: ACTIONS.AI_STEP,
    };
}


/** Move players in a direction offset.
 * @param playerName: name of player
 * @param offsetX: x-offset (-1|0|1)
 * @param offsetY: y-offset (-1|0|1)
 */

function movePlayer(playerName, offsetX, offsetY) {
    return {
        type: ACTIONS.MOVE_PLAYER,
        playload: {
            playerName, offsetX, offsetY
        },
    }
}


export {
    startGame,
    pauseGame,
    makeAiStep,
    movePlayer,
    toggleDebug,
}