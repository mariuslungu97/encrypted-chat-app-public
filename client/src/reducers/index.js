import {combineReducers} from 'redux';

import authReducer from './authReducer';
import errorReducer from './errorReducer';
import invitationsReducer from './invitationsReducer';
import twoFactorReducer from './twoFactorReducer';
import conversationsReducer from './conversationsReducer';
import socketReducer from './socketReducer';

export default combineReducers({
    error : errorReducer,
    invitations : invitationsReducer,
    auth : authReducer,
    twoFactor : twoFactorReducer,
    conversations : conversationsReducer,
    socket : socketReducer
});