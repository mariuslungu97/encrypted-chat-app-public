import {ADD_ERROR, CLEAR_ERROR} from './types';

export const addError = error => {
    return {
        type : ADD_ERROR,
        payload : {
            ...error
        }
    };
};

export const clearError = () => {
    return {
        type : CLEAR_ERROR
    }
};