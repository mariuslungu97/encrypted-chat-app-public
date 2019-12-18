import {
    SET_TYPE,
    SET_PAGE,
    GET_CONVERSATIONS_FAIL,
    GET_CONVERSATIONS_SUCCESS,
    CONVERSATIONS_LOADED,
    CONVERSATIONS_LOADING
    } from '../actions/types';

const initialState = {
    conversations : null,
    conversationsLoading : null,
    conversationsLoaded : null,
    currentPage : 0,
    currentType : 'all'
};

export default function(state=initialState, action) {
    switch(action.type) {
        case CONVERSATIONS_LOADING :
            return {
                ...state,
                conversationsLoading : true,
                conversationsLoaded : false
            };
        case SET_PAGE : 
            return {
                ...state,
                currentPage : action.payload
            }
        case SET_TYPE :
            return {
                ...state,
                currentType : action.payload
            }
        case CONVERSATIONS_LOADED : 
            return {
                ...state,
                conversationsLoading : false,
                conversationsLoaded : true
            };
        case GET_CONVERSATIONS_FAIL : 
            return {
                ...state,
                conversationsLoading : false,
                conversationsLoaded : false
            };
        case GET_CONVERSATIONS_SUCCESS : 
            return {
                ...state,
                conversations : action.payload
            }
        default:
            return state;
    };
}