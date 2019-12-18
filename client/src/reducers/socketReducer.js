import {
    SET_PUBLIC_PRIVATE_KEY_FAIL,
    SET_PUBLIC_PRIVATE_KEY_SUCCESSFUL,
    SOCKET_DISCONNECT_SUCCESS, 
    SOCKET_DISCONNECT_FAIL ,
    SOCKET_CONNECTED_FAIL, 
    SOCKET_CONNECTED_SUCCESS, 
    SOCKET_CONNECTING,
    JOIN_SUCCESS,
    JOIN_FAIL,
    MESSAGE_RECEIVED,
    ADD_MESSAGE,
    IS_TYPING,
    PUBLIC_KEY_RECEIVED
} from '../actions/types';

const initialState = {
    publicKey : null,
    arePublicPrivateKeysSet : null,
    isConnecting : null,
    isConnected : null,
    isDisconnected : null,
    isTyping : '',
    receiverPublicKey : null,
    currentRoom : null,
    hasJoined : null,
    messages : []
};

export default function(state = initialState, action) {
    switch(action.type) {
        case SOCKET_CONNECTING:
            return {
                ...state,
                isConnecting : true
            };
        case SOCKET_CONNECTED_SUCCESS:
            return {
                ...state,
                isConnecting : false,
                isConnected : true
            };
        case SOCKET_CONNECTED_FAIL:
            return {
                ...state,
                isConnecting : false,
                isConnected : false
            };
        case SOCKET_DISCONNECT_FAIL : 
            return {
                ...state,
                isDisconnected : false
            };
        case SOCKET_DISCONNECT_SUCCESS :
            return {
                ...state,
                isDisconnected : true
            }
        case SET_PUBLIC_PRIVATE_KEY_SUCCESSFUL:
            return {
                ...state,
                publicKey : action.payload,
                arePublicPrivateKeysSet : true
            };
        case SET_PUBLIC_PRIVATE_KEY_FAIL:
            return {
                ...state,
                publicKey : null,
                arePublicKeysSet : false
            };
        case IS_TYPING :
            return {
                ...state,
                isTyping : action.payload.message
            }
        case ADD_MESSAGE :
            return {
                ...state,
                messages : state.messages.concat(action.payload)
            }
        case PUBLIC_KEY_RECEIVED :
            return {
                ...state,
                receiverPublicKey : action.payload.key
            }
        case MESSAGE_RECEIVED :
            if(action.key) return {...state, messages : state.messages.concat(action.payload), receiverPublicKey : action.key}
            return {
                ...state,
                messages : state.messages.concat(action.payload)
            };
        case JOIN_SUCCESS :
            return {
                ...state,
                isJoined : true,
                currentRoom : action.payload.currentRoom,
                messages : []
            };
        case JOIN_FAIL :
            return {
                ...state,
                isJoined : false
            };
        default :
            return state;
    };
};