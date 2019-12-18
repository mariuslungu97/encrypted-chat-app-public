import {GET_ERROR, CLEAR_ERROR, ADD_ERROR} from '../actions/types';

const initialState = {
    message : null,
    status : null,
    id : null
};

export default function(state=initialState, action) {
    switch(action.type) {
        case ADD_ERROR:
            return {
                message : action.payload.message,
                status : action.payload.status,
                id : action.payload.id
            };
        case CLEAR_ERROR:
            return {
                message : null,
                status : null,
                id : null
            };
        case GET_ERROR:
            return state;
        default:
            return state;
    };
}