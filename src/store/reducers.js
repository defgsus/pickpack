import { combineReducers } from 'redux'
import { connectRouter, routerMiddleware } from 'connected-react-router'

import pickpackReducer from '../pickpack/store/reducers'


const rootReducer = (history) => combineReducers({
    router: connectRouter(history),
    pickpack: pickpackReducer
});

export default rootReducer
