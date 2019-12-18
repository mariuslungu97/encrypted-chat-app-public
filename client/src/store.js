import {createStore, applyMiddleware, compose} from 'redux';
import thunk from 'redux-thunk';
import rootReducer from './reducers';
import socketMiddleware from './socketMiddleware';
import webWorkerMiddleware from './webWorkerMiddleware';
import SocketClient from './utils/SocketClient/SocketClient';
import WebWorkerClient from './utils/WebWorkerClient/WebWorkerClient';
import MyWorker from './crypto.worker';


const initialState = {};

const socketClient = new SocketClient();
const webWorker = new MyWorker();
const webWorkerClient = new WebWorkerClient(webWorker);


const middleware = [thunk, webWorkerMiddleware(webWorkerClient), socketMiddleware(socketClient)];

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

const store = createStore(
    rootReducer,
    initialState,
    composeEnhancers(applyMiddleware(...middleware))
);

export default store;

