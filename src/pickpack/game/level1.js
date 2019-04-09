const
    _ = {"type": "empty"},
    W = {"type": "wall"},
    C = {"type": "chest", "movable": true},
    S = {"type": "shelf", "shelfName": "A1"};


const DEFAULT_MAP = {
    rows: [
        [W, W, W, W, W, W, W, W, W, W, W, W, W, W],
        [W, _, _, _, W, _, _, _, C, _, _, _, _, W],
        [W, _, _, _, W, _, _, _, _, _, _, _, _, W],
        [W, W, _, W, W, S, S, S, S, _, C, S, _, W],
        [W, _, _, _, _, _, C, _, _, _, C, S, _, W],
        [W, _, C, C, S, S, S, S, S, _, _, S, _, W],
        [W, _, _, _, _, _, _, _, _, C, _, S, _, W],
        [W, _, _, C, _, C, _, _, _, _, _, S, _, W],
        [W, _, _, _, _, _, _, C, _, _, _, C, _, W],
        [W, C, _, _, _, _, _, _, _, _, _, _, _, W],
        [W, _, C, _, S, S, S, S, S, S, _, S, _, W],
        [W, _, _, _, _, _, _, _, _, _, _, S, _, W],
        [W, _, _, _, S, S, S, S, S, _, _, S, _, W],
        [W, _, _, C, _, _, _, _, _, _, _, S, _, W],
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
    /*"Puck": {
        "position": [7, 5],
        "task": {
            type: "",
            playerName: "Pack",
        }
    },*/
};


export function deepCopy(obj) {
    return JSON.parse(JSON.stringify(obj));
}


function createLevelOneState() {
    const map = deepCopy(DEFAULT_MAP);
    const players = deepCopy(DEFAULT_PLAYERS);

    map.width = map.rows[0].length;
    map.height = map.rows.length;

    for (const playerName in players) {
        const player = players[playerName];
        map.rows[player.position[1]][player.position[0]] = {
            type: "player",
            playerName: playerName,
            movable: true,
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

export { createLevelOneState }