import { combineReducers } from 'redux'

import ACTIONS from "./actions"

import Map from "../game/Map"
import WayPoints from "../game/WayPoints"
import {
    createNewGameState,
    gameAiStep,
    processEvents
} from "../game/game"




const DEFAULT_STATE = {
    debug: false,
    map: null,
    players: null,
    playing: false,
    pause: false,
    playerName: "Pick",
    events: [],
    uiEvents: [],
};



const pickpackReducer = (state=DEFAULT_STATE, action) => {
    switch (action.type) {

        case ACTIONS.START_GAME: {
            return {
                ...state,
                ...createNewGameState(),
                playing: true,
            };
        }

        case ACTIONS.PAUSE_GAME: {
            return {
                ...state,
                pause: !state.pause,
            };
        }

        case ACTIONS.TOGGLE_DEBUG: {
            return {
                ...state,
                debug: !state.debug,
            };
        }

        case ACTIONS.MOVE_PLAYER: {
            const map = new Map(state);
            map.performMove(
                action.playload.playerName,
                action.playload.offsetX,
                action.playload.offsetY,
            );
            return {
                ...state,
                ...map.nextState(),
            };
        }

        case ACTIONS.AI_STEP: {
            const map = new Map(state);
            gameAiStep(map);
            processEvents(map);
            return {
                ...state,
                ...map.nextState(),
            };
        }

    }
    return state;
};

export default pickpackReducer;
