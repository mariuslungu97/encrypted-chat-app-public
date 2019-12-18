import axios from 'axios';

import {GET_INVITATIONS_SUCCESS, GET_INVITATIONS_FAIL, INVITATIONS_LOADING, INVITATIONS_LOADED, CREATE_INVITATION_SUCCESS, CREATE_INVITATION_FAIL, UPDATE_INVITATION_SUCCESS, UPDATE_INVITATION_FAIL, SET_PAGE, SET_TYPE} from './types';
import {tokenConfig} from './authActions';
import {addError} from './errorActions';


export const getInvitations = (currPage, currType) => (dispatch, getState) => {

    const url = `/api/invitations?page=${currPage}&type=${currType}`;

    dispatch(invitationsLoading());

    axios.get(url, tokenConfig(getState))
        .then(invitations => {
            dispatch(getInvitationsSuccess(invitations.data));
            dispatch(invitationsLoaded());
        })
        .catch(error => {
            dispatch(addError(error.response.data));
            dispatch(getInvitationsFail());
        });

};

export const patchInvitation = (invitationId, newStatus) => (dispatch, getState) => {
    const url = `/api/invitations/${invitationId}?status=${newStatus}`;
    
    axios.patch(url, null, tokenConfig(getState))
        .then( () => {
            //re-render updated invitation
            dispatch(getInvitations(getState().invitations.currentPage, getState().invitations.currentType));
            dispatch({
                type : UPDATE_INVITATION_SUCCESS
            });
        })  
        .catch(error => {
            dispatch(addError(error.response.data));
            dispatch({
                type : UPDATE_INVITATION_FAIL
            });
        });
};

export const createInvitation = (conversationName, email, invitationId) => (dispatch, getState) => {
    
    let newInvitation = {
        name : conversationName,
        to : email,
        invitationId
    };
    
    axios.post('/api/invitations', newInvitation, tokenConfig(getState))
        .then(() => {
            dispatch({
                type : CREATE_INVITATION_SUCCESS
            });
            dispatch(getInvitations(getState().invitations.currentPage, getState().invitations.currentType));
        })
        .catch(error => {
            dispatch(addError(error.response.data));
            dispatch({
                type : CREATE_INVITATION_FAIL
            });
        })
};

export const setNewPage = newPage => (dispatch, getState) => {
    dispatch({
        type : SET_PAGE,
        payload : newPage
    });

    dispatch(getInvitations(newPage, getState().invitations.currentType));
};

export const setNewType = newType => (dispatch) => {
    dispatch({
        type : SET_TYPE,
        payload : newType
    });

    dispatch(getInvitations(0, newType));
};

const invitationsLoading = () => {
    return {
        type : INVITATIONS_LOADING
    };
};

const invitationsLoaded = () => {
    return {
        type : INVITATIONS_LOADED,
    };
};

const getInvitationsSuccess = (invitations) => {
    return {
        type : GET_INVITATIONS_SUCCESS,
        payload : {
            ...invitations
        }
    };
};

const getInvitationsFail = () => {
    return {
        type : GET_INVITATIONS_FAIL
    };
};