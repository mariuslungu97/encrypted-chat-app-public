const express = require('express');
const bcryptjs = require('bcryptjs');
const keys = require('../../config/keys');
const utils = require('../../utils');
const jwt = require('jsonwebtoken');
const speakeasy = require('speakeasy');

const router = express.Router();

const User = require('../../models/Users');

function signJWT(user, res) {
    const id = user._id;
    jwt.sign({id}, keys.jwtSecret, {expiresIn : 1800}, (err, token) => {

        if (err) return res.status(500).json({message : err.message, status : '500', id : 'token_err'});

        const data = {
            token,
            user : {
                type : 'users',
                userId : user.userId,
                attributes : {
                    email : user.email,
                    isTwoFactorActive : user.isTwoFactorActive
                },
                links : {
                    self : `/api/users`
                }
            }
        };

        return res.status(200).json(data);
    });
}

//@route POST api/auth
//@desc Logs in an user and generates a token to be used for protected routes.
//@desc Checks if 2FA is activated. If yes, returns partial successful response if 6-number token is not provided, or token if 6-number is correct
//@access Public
router.post('/', (req, res) => {
    
    const {email, password, totp} = req.body;
    
    if(!email || typeof email !== 'string' || !utils.validateEmail(email)) {

        let error = {message : 'Invalid email address.', status : '400', id : 'email_invalid'};

        return res.status(400).json(error);

    } else {
        
        User.findOne({email})
            .then(user => {

                if(!user) return res.status(400).json({message : 'User with provided mail does not exist', status : '400', id : 'user_not_exists'});
                //Validate password
                if(!password || typeof password !== 'string' || password.length === 0) {
                    
                    let error = {message : 'No password provided.', status : '400', id : 'pass_not_provided'};            
                    return res.status(400).send(error);
                } else {
                    
                    const passErrArr = utils.validatePassword(password);

                    if(passErrArr && passErrArr.length > 0) {
                        
                        errorMsg = passErrArr.join(' ');

                        return res.status(422).json({message : errorMsg, status : '422' , id: 'pass_syntax_invalid'});

                    } else {
                        
                        bcryptjs.compare(password, user.password)
                                .then(isMatch => {
                                
                                if(!isMatch) return res.status(400).json({message : 'Wrong password', status : '400', id : 'invalid_credentials'});

                                //isTwoFactor activated?
                                if(user.isTwoFactorActive && user.twoFactorSecret.length > 0) {

                                    if(!totp) return res.status(206).json({message : 'Provide TOTP Token!', status : '206', id : 'provide_totp_token'});

                                    else if(isNaN(parseInt(totp, 10)) || totp.length !== 6) return res.status(400).json({message : 'TOTP Token Syntax not valid', status : '400', id : 'totp_syntax_not_valid'});

                                    const verified = speakeasy.totp.verify({
                                        secret : user.twoFactorSecret,
                                        encoding : 'base32',
                                        token : totp
                                    });

                                    if(verified) return signJWT(user, res);

                                    else return res.status(401).json({message : 'TOTP Token not valid.', status : '401', id : 'totp_not_valid'});

                                } else return signJWT(user, res);
                                
                        });
                    };
                };
            })
            .catch(err => {
                return res.status(500).json({message : err.message, status : '500', id : 'users_db_error'});
            });
    };
});

module.exports = router;