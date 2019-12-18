import {USER_LOADING, VERIFY_TOKEN, RESEND_VERIFICATION_MAIL_FAIL, RESEND_VERIFICATION_MAIL_SUCCESS, USER_LOADED, LOGIN_SUCCESS, LOGIN_FAIL, LOGOUT_SUCCESS, REGISTER_SUCCESS, REGISTER_FAIL, AUTH_ERROR} from '../actions/types';

const initialState = {
    token : localStorage.getItem('token'),
    isLoading : false,
    isLoaded : false,
    isRegistered : null,
    isAuthenticated : null,
    user : null,
    twoFactor : null,
    resendVerificationMail : null   
};

export default function(state=initialState, action) {
    switch(action.type) {
        case REGISTER_SUCCESS:
            return {
                ...state,
                isRegistered : true
            };
        case USER_LOADING :
            return {
                ...state,
                isLoading : true,
                isLoaded : false
            };
        case VERIFY_TOKEN :
            if(localStorage.getItem('token') !== null) localStorage.removeItem('token');    
            return {
                ...state,
                token : null,
                twoFactor : {
                    ...action.payload,
                    verifyToken : true
                }
            };
        case RESEND_VERIFICATION_MAIL_FAIL :
            return {
                ...state,
                resendVerificationMail : false
            };
        case RESEND_VERIFICATION_MAIL_SUCCESS : 
            return {
                ...state,
                resendVerificationMail : true
            };
        case USER_LOADED : 
            return {
                ...state,
                isLoading : false,
                isAuthenticated : true,
                user : action.payload,
                isLoaded : true
            };
        case LOGIN_SUCCESS : 
            localStorage.setItem('token', action.payload.token);
            return {
                ...state,
                ...action.payload,
                isAuthenticated : true,
                isLoading : false,
                isLoaded : false,
                twoFactor : null
            };
        case LOGOUT_SUCCESS :
        case AUTH_ERROR:
        case REGISTER_FAIL:
            localStorage.removeItem('token');
            return {
                ...state,
                isAuthenticated : false,
                isLoading : false,
                token : null,
                user : null, 
                isLoaded : false,
                twoFactor : null
            };
        case LOGIN_FAIL : 
            return {
                ...state,
                isAuthenticated : false,
                isLoading : false,
                token : null,
                user : null, 
                isLoaded : false
            }
        default:
            return state;
    };
};

