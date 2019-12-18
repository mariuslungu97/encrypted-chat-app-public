import {QR_IS_LOADING, GET_QRCODE_FAIL, GET_QRCODE_SUCCESS, ACTIVATE_TWOFACTOR_FAIL, ACTIVATE_TWOFACTOR_SUCCESS} from '../actions/types';

const initialState = {
    isLoading : false,
    qrData : null,
    isActivated : false
};

export default function (state = initialState, action) {
    switch(action.type) {
        case GET_QRCODE_FAIL :
            return {
                ...state,
                isLoading : false
            };
        case QR_IS_LOADING :
            return {
                ...state,
                isLoading : true
            };
        case GET_QRCODE_SUCCESS :
            return {
                ...state,
                isLoading : false,
                qrData : action.payload
            };
        case ACTIVATE_TWOFACTOR_FAIL : 
            return {
                ...state,
                isActivated : false
            };
        case ACTIVATE_TWOFACTOR_SUCCESS :
            return {
                ...state,
                isActivated : true
            };
        default :
            return state;
    };
};
