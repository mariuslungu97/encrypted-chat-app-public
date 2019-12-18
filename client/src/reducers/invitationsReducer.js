import {GET_INVITATIONS_SUCCESS, GET_INVITATIONS_FAIL, INVITATIONS_LOADING, INVITATIONS_LOADED, CREATE_INVITATION_SUCCESS, CREATE_INVITATION_FAIL, SET_TYPE, SET_PAGE} from '../actions/types';

const initialState = {
    invitations : null,
    isLoading : false,
    isLoaded : false,
    isCreated : null,
    isUpdated : null,
    currentType : 'all',
    currentPage : 0
};

export default function (state = initialState, action) {
    switch(action.type) {
        case INVITATIONS_LOADING : 
            return {
                ...state,
                isLoading : true,
                isLoaded : false
            };
        case CREATE_INVITATION_SUCCESS :
            return {
                ...state,
                isCreated : true
            };
        case CREATE_INVITATION_FAIL :
            return {
                ...state,
                isCreated : false
            }
        case INVITATIONS_LOADED : 
            return {
                ...state,
                isLoading : false,
                isLoaded : true
            };
        case GET_INVITATIONS_SUCCESS : {
            return {
                ...state,
                isLoaded : true,
                invitations : action.payload
            };
        }
        case GET_INVITATIONS_FAIL : {
            return {
                ...state,
                isLoading : false,
                isLoaded : false
            }
        }
        case SET_PAGE : 
            return {
                ...state,
                currentPage : action.payload
            }
        case SET_TYPE : 
            return {
                ...state,
                currentPage : 0,
                currentType : action.payload
            }
        default :
            return state;
    }
};
