//imports
const express = require('express');
const nodemailer = require('nodemailer');
const utils = require('../../utils');
const bcryptjs = require('bcryptjs');
const {randomBytes} = require('crypto');
const keys = require('../../config/keys');
const auth = require('../../middleware/auth');

const router = express.Router();

//User, EmailVerification Model
const User = require('../../models/Users');
const EmailVerification = require('../../models/EmailVerification');

/*
SMTP Email Transport Config
Will use GMail for development
TODO: Gmail for development, to be replaced for production
*/

const smtpTransport = nodemailer.createTransport({
    service : 'Gmail',
    auth : {
        user : keys.gmailUser,
        pass : keys.gmailPass
    }
});

// @route GET api/users
// @desc GET a single user, based on id encoded in provided token
// @access Private, only for owner of account
router.get('/', auth, (req, res) => {
    const id = String(req.user.id);
    
    if(id && id.length > 0) {
        User.findById(id, '-password -twoFactorTempSecret -twoFactorSecret')
            .then(user => {
                if(user) {
                    //create userData obj to be returned
                    const userData = {
                        type : 'users',
                        attributes : {
                            email : user.email,
                            isActive : user.isActive,
                            createdAt : user.createdAt,
                            isTwoFactorActive : user.isTwoFactorActive
                        },
                        userId : user.userId,
                        links : {
                            self : `/api/users`,
                            related : {
                                href : `/api/invitations`
                            }
                        }
                    };

                    res.status(200).json(userData);
                } else {
                    res.status(410).json({message : 'User with provided ID not found.', status : '410', id : 'user_not_found'})
                }
            })
            .catch(error => {
                console.log(error.stack);
                res.status(500).json({message : error.message, id: 'db_error', status : '500'});
            })
    } else {
        res.status(400).json({message : 'Query ID parameter is invalid.', status : '400', id : 'invalid_query_parameter'})
    }
})

// @route POST api/users
// @desc Create and store new user, send email verification to provided email address
// @access public
router.post('/', utils.wrapAsync(async (req, res, next) => {

    const {userId, email, password} = req.body;

    if(userId && userId.length > 0) {
        
        //mail is valid?
        if(!email || typeof email !== 'string' || !utils.validateEmail(email)) {
            let error = {message : 'Invalid email address.', status : '400', id : 'email_invalid'};
            return res.status(400).json(error);
        }
        else {
            //email with userId already in db?
            try {
                const userEmail = await User.find({email});
                if (userEmail && userEmail.length > 0) {
                    let error = {message : 'Provided email already used', status : '409', id : 'email_exists'};
                    return res.status(409).json(error);
                }
            } catch (error) {
                next(error);
            }           
        }
   
        //Check Password

        if(!password || password.length === 0) {
            //password is undefined or length === 0
            let error = {message : 'No password provided.', status : '400', id : 'pass_not_provided'};            
            return res.status(400).send(error);
        }
        else {
            //a password has been set, check if password is valid
            const passErrArr = utils.validatePassword(password);

            if(passErrArr && passErrArr.length > 0) {
                //password is not valid
                errorMsg = passErrArr.join(' ');

                return res.status(422).json({message : errorMsg, status : '422' , id: 'pass_invalid'});
            } else {
                try {
                    let data = [];
                    //generate password
                    const salt = await bcryptjs.genSalt(10);
                    const hash = await bcryptjs.hash(password,salt);

                    const newUser = new User({
                        userId,
                        email,
                        password : hash
                    });
                    const savedUser = await newUser.save();
                    //userData to be returned as JSON
                    const userData = {
                        type : 'users',
                        userId : savedUser.userId,
                        attributes : {
                            email : savedUser.email
                        },
                        links : {
                            self : `/api/users`
                        }
                    };
                    data.push(userData);

                    //generate random string to add to route
                    const rand = randomBytes(20).toString('hex').slice(0,14);
                    //create new verification
                    const newEmailVerification = new EmailVerification({
                        email : savedUser.email,
                        userId: savedUser.userId,
                        rand
                    });

                    const emailVerification = await newEmailVerification.save();

                    const emailVerificationData = {
                        type : 'emailVerification',
                        attributes : {
                            userId : emailVerification.userId
                        }
                    };

                    data.push(emailVerificationData);

                    //send confirmation mail
                    const link = `${req.protocol}://${req.get('host')}/api/verify?rand=${emailVerification.rand}`;

                    const sentMail = smtpTransport.sendMail(utils.customMailOptions(savedUser.email, link));
                    //sentEmailData to be returned as JSON
                    const sentMailData = {
                        type : 'sentEmail',
                        id : sentMail.messageId,
                    };
                    data.push(sentMailData);

                    return res.status(201).json(data);
                } catch(error) {
                    next(error);
                } 
            }
        }
    } else {
        const error = {message : 'UserId has not been provided.', status : '400', id : 'userId_not_provided'};
        res.status(400).json(error);
    }
}));

// @route DELETE api/users/:id
// @desc  Delete user from DB
// @access Private, only for own account
router.delete('/:id', auth, (req, res) => {
    const {id} = req.user;
    if(id && id.length > 0) {
        User.findById(id)
        .then(user => user.remove().then(() => res.json({success : true, description: `Item with id: ${id} has been removed.`})))
        .catch(err => res.status(404).json({success : false, err, description: `Item with id: ${id} has not been found.`}))
    };
});

module.exports = router;

