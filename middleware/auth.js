const keys = require('../config/keys');
const jwt = require('jsonwebtoken');

function auth(req, res, next) {
    //get token
    const token = req.header('x-auth-token');

    if(!token) return res.status(401).json({message : 'No token, authorization denied', status : '401', id : 'authorization_denied'});
    try {
        //decode token
        const decoded = jwt.verify(token, keys.jwtSecret);

        //add payload to req
        req.user = decoded;

        next();
    } catch(error) {
        return res.status(400).json({message : 'Token is not valid', status : '400', id : 'token_invalid'});
    }
    
};

module.exports = auth;