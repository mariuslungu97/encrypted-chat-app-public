const express = require('express');
const {randomBytes} = require('crypto');
const nodemailer = require('nodemailer');

const EmailVerification = require('../../models/EmailVerification');
const Users = require('../../models/Users');
const keys = require('../../config/keys');
const auth = require('../../middleware/auth');
const utils = require('../../utils');

const router = express.Router();

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

/*
    --Route which handles emailVerification process
    --After being registered, newly created user is sent a mail with a custom link to his provided mail address for verification
    --The link contains a rand sequence to it. When user hits route, emailVerification instance is deleted from DB(no longer needed)
    --user isActive status === true
*/

router.get('/', (req, res) => {
    const rand = req.query.rand;
    
    if(rand) {
        //Check for emailVerification record with same rand and id
        EmailVerification.findOneAndDelete({rand}, (err, emailVerification) => {
            
            if(err) return res.status(500).json({message : err.message, status : err.status, id : 'db_error'});
            
            if(emailVerification) {
                //delete all the other instances with same userId too, no longer needed since status === active
                EmailVerification.deleteMany({userId : emailVerification.userId}, (err, deleted) => {
                    if(err) return res.status(500).json({message : err.message, id: 'db_error', status : '500'});

                    //set User isActive record to true
                    Users.findOneAndUpdate({userId : emailVerification.userId}, {isActive : true}, (err, user) => {
                        if(err) return res.status(500).json({message : err.message, status : err.status, id : 'db_error'});
                        
                        if(user) {
                            const userData = {
                                type : 'users',
                                userId : user.userId,
                                attributes : {
                                    email : user.email,
                                    isActive : user.isActive
                                },
                                links : {
                                    self : '/api/users'
                                }
                            };
                            return res.status(200).json(userData);
                        } else {
                            return res.status(410).json({message : 'User with provided ID not found.', status : '410', id : 'user_not_found'});
                        }
                    });
                });        
            } else {
                //record not found
                return res.status(410).json(
                    {
                     message : 'The link has either expired or the account has been already activated', 
                     status : '410',
                     id:'invalid_link'
                    }
                );
            }
        })   
    } 
});


// @route GET api/verify/:userId
// @desc Resend email verification if status != active
// @access private, only for logged in user
router.get('/:userId', auth, (req, res) => {
    const {userId} = req.params;
    const {id} = req.user;

    if(id && userId && typeof userId === 'string') {

        Users.findById(id, (err, user) => {
            if(err) return res.status(500).json({message : err.message, id: 'db_error', status : '500'});

            if(user) {
                if(userId !== user.userId) return res.status(404).json({message : 'User with provided userId not found.', status : '410', id : 'user_not_found'});

                if(user.isActive) return res.status(400).json({message : 'User status is already active', status : '400', id : 'status_active'});

                //generate random string to add to route
                const rand = randomBytes(20).toString('hex').slice(0,14);
                //create new verification
                const newEmailVerification = new EmailVerification({
                    email : user.email,
                    userId: user.userId,
                    rand
                });

                newEmailVerification.save()
                    .then(emailVerification => {
                        //send confirmation mail
                        const link = `${req.protocol}://${req.get('host')}/api/verify?rand=${emailVerification.rand}`;

                        const sentMail = smtpTransport.sendMail(utils.customMailOptions(user.email, link));

                        const sentMailData = {
                            type : 'sentEmail',
                            id : sentMail.messageId,
                        };

                        return res.status(201).json(sentMailData);
                    })
                    .catch(err => res.status(500).json({message : err.message, id: 'db_error', status : '500'}))
            };
        });

    } else {
        res.status(400).json({message : 'Invalid query parameter.', status : '400', id : 'invalid_query_parameter' });
    };

});

module.exports = router;