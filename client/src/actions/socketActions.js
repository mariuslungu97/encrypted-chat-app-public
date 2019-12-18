import {

    SOCKET_CONNECTING,
    SOCKET_CONNECTED_SUCCESS,
    SOCKET_CONNECTED_FAIL,
    SOCKET_DISCONNECT_SUCCESS,
    ADD_ERROR,
    IS_TYPING,
    MESSAGE_RECEIVED,
    PUBLIC_KEY_RECEIVED,
    SET_PUBLIC_PRIVATE_KEY_SUCCESSFUL,
    SET_PUBLIC_PRIVATE_KEY_FAIL,
    JOIN_SUCCESS,
    JOIN_FAIL,
    SOCKET_DISCONNECT_FAIL,
    ADD_MESSAGE
} from './types';

export const establishSocketConnection = () => {
    return {
        type : 'socket',
        types : [SOCKET_CONNECTING, SOCKET_CONNECTED_SUCCESS, SOCKET_CONNECTED_FAIL],
        promise : (socket) => socket.connect()
    };
};

export const closeSocketConnection = () => {
    return {
        type : 'socket',
        types : [null, SOCKET_DISCONNECT_SUCCESS, SOCKET_DISCONNECT_FAIL],
        promise : (socket) => socket.emit('request_disconnect')
    }
};

const receiveMessageHandler = (data, dispatch) => {
    if(data && data.type) {
        if(data.type === 'error') dispatch({type : ADD_ERROR, payload : data});
        else if(data.type === 'status') {
            if(data.id === 'IS_TYPING') dispatch({type : IS_TYPING, payload : data});
            else if(data.id === 'NEW_CONNECTION') {
                dispatch(sendPublicKey());
                dispatch({type : MESSAGE_RECEIVED, payload : data, key : data.key ? data.key : null});
            }
            else if(data.id === 'PUBLIC_KEY') {
                dispatch ({type : PUBLIC_KEY_RECEIVED, payload : data});
            }
            else dispatch({type : MESSAGE_RECEIVED, payload : data});
        }
        else {
            if(data.id === 'NEW_MESSAGE') dispatch(decryptData(data));
            else dispatch({type : MESSAGE_RECEIVED, payload : data});
        }
    };
}

export const setSocketEventListeners = () => (dispatch) => {

    console.log('----Set Socket Event Listeners-----')

    const events = [ 
        'NEW_MESSAGE', 
        'NEW_CONNECTION', 
        'USER_DISCONNECTED', 
        'JOIN_NOT_ALLOWED', 
        'ROOM_NOT_FOUND', 
        'INTRUSION_ATTEMPT',
        'IS_TYPING',
        'PUBLIC_KEY'
    ];

    events.forEach(event => dispatch({
        type : 'socket',
        types : [null, null, null],
        promise : (socket) => socket.on(event, (data) => receiveMessageHandler(data, dispatch))
    }));

};

export const generateKeyPair = () => dispatch => {
    dispatch({
        type : 'worker',
        types : [null, SET_PUBLIC_PRIVATE_KEY_SUCCESSFUL, SET_PUBLIC_PRIVATE_KEY_FAIL],
        promise : (worker) => worker.create()
    });
};

export const sendPublicKey = () => (dispatch, getState) => {
    const data = {
        email : getState().auth.user ? getState().auth.user.attributes.email : '',
        key : getState().socket.publicKey
    };

    console.log(`Sending public key!`, data);

    dispatch({
        type : 'socket',
        types : [null, null, null],
        promise : (socket) => socket.emit('PUBLIC_KEY', data)
    });
}

export const joinRoom = (roomId, timestamp) => (dispatch, getState) => {
    
    const data = {
        roomName : roomId,
        token : getState().auth.token,
        email : getState().auth.user ? getState().auth.user.attributes.email : '',
        key : getState().socket.publicKey,
        timestamp
    };
    
    dispatch({
        type : 'socket',
        types : [null, JOIN_SUCCESS, JOIN_FAIL],
        promise : (socket) => socket.emit('join', data)
    });
};

export const sendMessage = (message, timestamp) => (dispatch, getState) => {
    
    const data = {
        message,
        email : getState().auth.user ? getState().auth.user.attributes.email : '',
        timestamp
    };

    dispatch({
        type : 'socket',
        types : [null, MESSAGE_RECEIVED, MESSAGE_RECEIVED],
        promise : (socket) => socket.emit('NEW_MESSAGE', data)
    });
};

export const isTyping = (timestamp, isTyping) => (dispatch, getState) => {

    const data = {
        email : getState().auth.user ? getState().auth.user.attributes.email : '',
        timestamp,
        isTyping
    };

    dispatch({
        type : 'socket',
        types : [null, null, null],
        promise : (socket) => socket.emit('IS_TYPING', data)
    });

};
//encrypt and send data 
export const encryptData = (data, timestamp, publicKey) => (dispatch, getState) => {

    const viewData = {
        message : data,
        email : getState().auth.user ? getState().auth.user.attributes.email : '',
        timestamp,
        type : 'message'
    };

    dispatch(addMessage(viewData));
    //check if receiver public key has arrived; if not, do not send message to the web
    if(getState().socket.receiverPublicKey) dispatch({
        type : 'worker',
        types : [null, null, null],
        callback : {type : 'socket', viewData, types : [null, null, null]},
        promise : (worker) => worker.postAndWait('encrypt', [data, publicKey])
    });

};

const addMessage = (data) => {
    return {
        type : ADD_MESSAGE,
        payload : data
    };
};

const decryptData = (data) => dispatch => {
    dispatch({
        type : 'worker',
        types : [null, MESSAGE_RECEIVED, MESSAGE_RECEIVED],
        promise : (worker) => worker.postAndWait('decrypt', data)
    });
};