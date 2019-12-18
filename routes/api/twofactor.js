const express = require('express');
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');

const Users = require('../../models/Users');
const auth = require('../../middleware/auth');

const router = express.Router();


// @route GET api/twofactor
// @desc First step activation process for 2FA, generate secret, send QR Code to user to scan and send token
// @access private, only for logged in user
router.get('/setup', auth, (req, res) => {

    const {id} = req.user;

    if(id) {
        Users.findById(id, (err, user) => {
            if(err) return res.status(500).json({message : err.message, status : '500', id : 'db_error'});

            if(user) {

                if(!user.isActive) return res.status(400).json({message : 'User account is not active. You first need to activate your account', status : '400', id : 'user_not_active'});

                if(user.isTwoFactorActive || user.twoFactorSecret.length > 0) return res.status(400).json({message : 'Two factor authentication is already active. You cannot activate it twice.', id : 'two_factor_active', status : '400'});

                const secret = speakeasy.generateSecret();

                user.twoFactorTempSecret = secret.base32;

                user.save()
                    .then(patchedUser => {
                        if(patchedUser) {

                            QRCode.toDataURL(secret.otpauth_url, (err, dataUrl) => {
                                if (err) return res.status(500).json({message : err.message, status : '500', id : 'db_error'});
    
                                const data = {
                                    type : 'url',
                                    status : '201',
                                    url : dataUrl
                                };
    
                                return res.status(201).json(data);
                            });
                        };
                    })
                    .catch(err => res.status(500).json({message : err.message, status : '500', id : 'db_error'}))

            } else return res.status(404).json({message : 'User with provided ID not found!', status : '404', id : 'user_not_found'});
        })
    }
});

// @route POST api/twofactor
// @desc GET token, validate it, and set twoFactor to true if token is valid
// @access private, only for logged in user
router.post('/setup', auth, (req, res) => {
    const {id} = req.user;
    const {totp} = req.body;

    if(id && totp && typeof totp === 'string' && totp.length === 6 && !isNaN(parseInt(totp,10))) {

        Users.findById(id, (err, user) => {
            if(err) return res.status(500).json({message : err.message, status : '500', id : 'db_error'});

            if(user) {

                if(user.isTwoFactorActive || user.twoFactorSecret.length > 0) return res.status(400).json({message : 'Two factor authentication is already active. You cannot activate it twice.', id : 'two_factor_active', status : '400'});

                if(!user.twoFactorTempSecret) return res.json(400).json({message : 'Temp Secret not set. You should first try to GET the QR code from /twofactor/setup', status : '400'});

                const verified = speakeasy.totp.verify({
                    secret : user.twoFactorTempSecret,
                    encoding : 'base32',
                    token : totp
                });

                if(verified) {
                    //set permanent secret
                    user.twoFactorSecret = user.twoFactorTempSecret;
                    user.twoFactorTempSecret = '';
                    user.isTwoFactorActive = true;

                    user.save()
                        .then(savedUser => {
                            return res.status(200).json({message : 'Two-factor auth is now enabled.', status : '200', id : 'twoFactor_activated'});
                        })
                } else {
                    return res.status(400).json({message : 'Invalid totp token, verification failed', status : '400', id : 'totp_token_invalid'});
                } 
            }
        })

    } else return res.status(400).json({message : 'POST parameter not found. You should first try to GET the QR code from /twofactor/setup', id : 'bad_post_param', status : '400'});
});

module.exports = router;