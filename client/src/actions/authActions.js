import {
    LOGIN_SUCCESS, 
    VERIFY_TOKEN, 
    RESEND_VERIFICATION_MAIL_SUCCESS, 
    RESEND_VERIFICATION_MAIL_FAIL,
     AUTH_ERROR, 
     LOGIN_FAIL, 
     LOGOUT_SUCCESS, 
     REGISTER_SUCCESS, 
     REGISTER_FAIL, 
     USER_LOADING, 
     USER_LOADED} 
from './types';
import axios from 'axios';
import {addError} from './errorActions';
import {establishSocketConnection, closeSocketConnection, generateKeyPair} from './socketActions';


//register user
export const registerUser = (email, password, userId) => {
    return dispatch => {
        //send data to api and dispatch actions
 
        const user = {
            email,
            password,
            userId
        };

        const headers = {
            'content-type' : 'application/json'
        };

        axios.post('/api/users', user, headers)
            .then(user => {
                dispatch(registerUserSuccess());
            })
            .catch(error => { 
                dispatch(registerUserFailure());
                dispatch(addError(error.response.data)) 
            });
    }
};

//login user
export const loginUser = (email = null, password = null, totpToken) => {
    return (dispatch, getState) => {
        const headers = {
            'content-type' : 'application/json',
        };

        if (email && password) {
            const user = {
                email,
                password
            };
    
            axios.post('/api/auth', user, headers)
                .then(user => {
                    if(!user.data.token) {
                        if(user.data.status === '206') dispatch(verifyToken(email, password));
                        else dispatch(addError(user.data));
                    } else {
                        dispatch(loginUserSuccess(user.data));
                    };  
                })
                .catch(error => {
                    dispatch(addError(error.response.data));
                    dispatch(loginUserFail());
                });
        } else if(totpToken && getState().auth.twoFactor) {
            //login user with provided totpToken
            const user = {
                email : getState().auth.twoFactor.email,
                password : getState().auth.twoFactor.password,
                totp : totpToken
            };

            axios.post('/api/auth', user, headers)
                 .then(user => {
                     dispatch(loginUserSuccess(user.data));
                 })
                 .catch(error => {
                     dispatch(addError(error.response.data));
                     dispatch(loginUserFail());
                 });
        }

        
    }
};

//load user
export const loadUser = () => (dispatch, getState) => {
    //user loading
    dispatch(userLoading());

    axios.get(`/api/users`, tokenConfig(getState))
        .then(user => {
            //load user, establish socket connection, generate RSA public-private key pair
            dispatch(userLoaded(user.data));
            dispatch(establishSocketConnection());
            dispatch(generateKeyPair());
        })
        .catch(error => {
            console.log(error);
            dispatch(addError(error.response.data));
            dispatch(authenticationFailed());
            dispatch(closeSocketConnection());
        });
};

export const logoutUser = () => (dispatch) => {
    dispatch({type : LOGOUT_SUCCESS});
    dispatch(closeSocketConnection());
};

export const resendVerificationMail = (userId) => (dispatch, getState) => {

    axios.get(`/api/verify/${userId}`, tokenConfig(getState))
         .then(() => {
            dispatch({
                type : RESEND_VERIFICATION_MAIL_SUCCESS
            });
         })
         .catch(error => {
             dispatch(addError(error.response.data));
             dispatch({
                 type : RESEND_VERIFICATION_MAIL_FAIL
             })
         });
};

//get token and set config headers
//returns config object with headers possibly including the token
export const tokenConfig = getState => {
    const token = getState().auth.token;

    const config = {
        headers : {
            'content-type' : 'application/json'
        }
    };

    if(token) config.headers['x-auth-token'] = token;

    return config;
}


//below are helper function returning action objects
const loginUserSuccess = user => {
    return {
        type : LOGIN_SUCCESS,
        payload : {
            ...user
        }
    };
};

const verifyToken = (email, password) => {
    return {
        type : VERIFY_TOKEN,
        payload : {
            email,
            password
        }
    };
};

const userLoading = () => {
    return {
        type : USER_LOADING 
    };
};

const authenticationFailed = () => {
    return {
        type : AUTH_ERROR
    };
};

const userLoaded = (user) => {
    return {
        type : USER_LOADED,
        payload : {
            ...user
        }
    };
};

const loginUserFail = () => {
    return {
        type : LOGIN_FAIL
    };
};

const registerUserSuccess = () => {
    return {
        type : REGISTER_SUCCESS
    };
};

const registerUserFailure = () => {
    return {
        type : REGISTER_FAIL,
    };
};

