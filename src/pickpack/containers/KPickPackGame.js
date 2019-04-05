import { connect } from 'react-redux'
import { push } from 'connected-react-router'

import PickPackGame from "../components/PickPackGame"
import {
    movePlayer,
    makeAiStep,
    pauseGame,
    startGame,
    toggleDebug
} from "../store/actions"


const mapStateToProps = state => ({
    ...state.pickpack,
});

const mapDispatchToProps = (dispatch, ownProps) => ({actions: {
    startGame: () => dispatch(startGame()),
    pauseGame: () => dispatch(pauseGame()),
    toggleDebug: () => dispatch(toggleDebug()),
    movePlayer: (name, offsetX, offsetY) => dispatch(movePlayer(name, offsetX, offsetY)),
    aiStep: () => dispatch(makeAiStep()),
}});


export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(PickPackGame)
