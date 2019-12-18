import axios from 'axios';

import {QR_IS_LOADING, GET_QRCODE_FAIL, GET_QRCODE_SUCCESS, ACTIVATE_TWOFACTOR_FAIL, ACTIVATE_TWOFACTOR_SUCCESS} from './types';
import {tokenConfig, logoutUser} from './authActions';
import {addError} from './errorActions';

export const getQRCode = () => (dispatch, getState) => {

    dispatch(qrIsLoading());

    axios.get('/api/twofactor/setup', tokenConfig(getState))
         .then(res => {
            dispatch(qrCodeSuccess(res.data));
         })
         .catch(error => {
            dispatch(qrCodeFail());
            dispatch(addError(error.response.data));
         })

};

export const activateTwoFactor = (token) => (dispatch, getState) => {

    const data = {
        totp : token
    };

    axios.post('/api/twofactor/setup', data, tokenConfig(getState))
         .then(res => {
            dispatch(activateTwoFactorSuccess());
            dispatch(logoutUser());
         })
         .catch(error => {
            dispatch(addError(error.response.data));
            dispatch(activateTwoFactorFail());
         });

};

const activateTwoFactorFail = () => {
    return {
        type : ACTIVATE_TWOFACTOR_FAIL
    };
};

const activateTwoFactorSuccess = () => {
    return {
        type : ACTIVATE_TWOFACTOR_SUCCESS
    };
};

const qrIsLoading = () => {
    return {
        type : QR_IS_LOADING
    };
};

const qrCodeSuccess = data => {
    return {
        type : GET_QRCODE_SUCCESS,
        payload : data
    };
};

const qrCodeFail = () => {
    return {
        type : GET_QRCODE_FAIL
    };
};

