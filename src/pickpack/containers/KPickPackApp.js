import { connect } from 'react-redux'
import { push } from 'connected-react-router'

import PickPackApp from "../components/PickPackApp"
import {
    startGame
} from "../store/actions"


const mapStateToProps = state => ({
    ...state.pickpack,
});

const mapDispatchToProps = (dispatch, ownProps) => ({actions: {
    startGame: () => dispatch(startGame())
}});


export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(PickPackApp)
