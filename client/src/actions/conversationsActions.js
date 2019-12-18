import {
    SET_PAGE,
    SET_TYPE,
    CONVERSATIONS_LOADING,
    CONVERSATIONS_LOADED,
    GET_CONVERSATIONS_SUCCESS, 
    GET_CONVERSATIONS_FAIL
    } 
from './types';

import {tokenConfig} from './authActions';
import {addError} from './errorActions';

import axios from 'axios';

//get conversations list
export const getConversations = (currPage, currType) => (dispatch, getState) => {
    const url = `/api/conversations?page=${currPage}&type=${currType}`;

    dispatch(conversationsLoading());

    axios.get(url, tokenConfig(getState))
        .then(conversations => {
            dispatch(getConversationsSuccess(conversations.data));
            dispatch(conversationsLoaded());
        })
        .catch(error => {
            dispatch(addError(error.response.data));
            dispatch(getConversationsFail());
        });
};

//change page
export const setNewConversationsPage = newPage => (dispatch, getState) => {
    dispatch({
        type : SET_PAGE,
        payload : newPage
    });

    dispatch(getConversations(newPage, getState().invitations.currentType));
};

//change type
export const setNewConversationsType = newType => (dispatch) => {
    dispatch({
        type : SET_TYPE,
        payload : newType
    });

    dispatch(getConversations(0, newType));
};

const getConversationsSuccess = conversations => {
    return {
        type : GET_CONVERSATIONS_SUCCESS,
        payload : {
            ...conversations
        }
    };
};

const conversationsLoading = () => {
    return {
        type : CONVERSATIONS_LOADING
    };
};

const conversationsLoaded = () => {
    return {
        type : CONVERSATIONS_LOADED
    };
};

const getConversationsFail = () => {
    return {
        type : GET_CONVERSATIONS_FAIL
    };
};





