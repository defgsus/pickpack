import { createStore, applyMiddleware, compose } from 'redux'
import logger from 'redux-logger'
import { connectRouter, routerMiddleware } from 'connected-react-router'

import { createBrowserHistory } from 'history'

import rootReducer from './reducers'

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

export const history = createBrowserHistory();

const store = createStore(
    rootReducer(history),
    { },
    composeEnhancers(
        applyMiddleware(
            routerMiddleware(history),
            //logger
        )
    ));

export default store
