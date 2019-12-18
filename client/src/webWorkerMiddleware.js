export default function socketMiddleware(worker) {
    return ({dispatch, getState}) => next => action => {
        if(typeof action === 'function') {
            return action(dispatch, getState);
        };

        /*
            * Web Worker Middleware Usage.
            * promise: (worker) => worker.create()
            * type: always 'worker'
            * types: [REQUEST, SUCCESS, FAILURE]
        */

        const {promise, type, types, callback, ...rest} = action;

        if(type !== 'worker' || !promise) {
            return next(action);
        };

        const [REQUEST, SUCCESS, FAILURE] = types;
        
        if(REQUEST) next({...rest, type: REQUEST});

        return promise(worker)
            .then((result) => {
                if(callback && typeof callback === 'object') {
                    const data = {...callback.viewData, message : result};
                    const promise = (socket) => socket.emit('NEW_MESSAGE', data);
                    return next({...callback, promise});
                }
                return next({...rest, payload : result, type : SUCCESS});
            })
            .catch((error) => {
                return next({...rest, payload : error, type : FAILURE})
            })
    };
};