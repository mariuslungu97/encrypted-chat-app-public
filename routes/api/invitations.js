const express = require('express');
const auth = require('../../middleware/auth');
const utils = require('../../utils');
const uniqid = require('uniqid');

const router = express.Router();

const User = require('../../models/Users');
const Invitation = require('../../models/Invitations');
const Conversations = require('../../models/Conversations');

async function returnPageQuery(typeFc, page = 0, res, next) {
    let query;

    try {
        const docsCount = await Invitation.countDocuments(typeFc);

        if(docsCount) {
            let nrPages = Math.ceil(docsCount / 5);

            if(page <= nrPages - 1) {   
                //create query
                const without = {"from.id" : 0, "to.id" : 0};
                query = Invitation.find(typeFc, without).sort({createdAt : 'desc'});
                return {
                    query,
                    meta : {
                        page : parseInt(page, 10),
                        nrPages,
                        docsCount
                    }
                };
            } else {
                //page query bigger than nr of pages
                return res.status(404).json({message : 'Page query bigger than number of pages', status : '404', id : 'query_not_valid'});   
            }

        } else {
            //no docs with specified type
            return res.status(404).json({message : 'No invitations with specified type', status : '404', id : 'invitations_not_found'});
        }
    } catch(error) {
        next(error);
    };
};

function getTypeFc(type = 'all', userId) {
    let typeFc;

    if(type === 'all') return {$or : [{"from.id" : userId}, {"to.id" : userId}]};
    else if(type === 'sent') return {"from.id" : userId};
    else if(type === 'received') return {"to.id" : userId};
    
    return typeFc;
}

//@route GET api/invitations
//@route GET api/invitations?page=m
//@route GET api/invitations?type=n
//@route GET api/invitations?page=m&type=n
//@desc get user invitations based on page and type query params, if provided. If not, get all invitations if count <= 5; else get first five invitations
//@access PRIVATE, only for owner of account with valid token

router.get('/', auth, utils.wrapAsync(async (req, res, next) => {
    //1. get encoded ID and query params, if any
    const {id} = req.user;
    const {page, type} = req.query;

    if(id) {
        //2. check if additional query params are valid
        let isPageParamValid, isTypeParamValid = null;
       
        if(page) !isNaN(+page) && page >= 0 ? isPageParamValid = true : isPageParamValid = false;

        if(type) typeof type === 'string' && (type === 'all' || type === 'sent' || type === 'received') ? isTypeParamValid = true : isTypeParamValid = false;
        
        const badRequestRes = {message : 'Bad Request. Please try again after modifying the current request', status : '400', id : 'bad_request'};

        if(isTypeParamValid === false || isTypeParamValid === false) return res.status(400).json(badRequestRes); 

        let query;

        const typeFc = isTypeParamValid ? getTypeFc(type, id.toString()) : getTypeFc(undefined, id.toString());
        
        if(isPageParamValid) query = await returnPageQuery(typeFc, page, res, next);

        else query = await returnPageQuery(typeFc, undefined, res, next);

        if(query.query && query.meta) {
            try {
                const invitationData = await query.query.exec();

                if(invitationData) {
                    
                    const data = {
                        type : 'invitations',
                        data : invitationData.slice(query.meta.page * 5, (query.meta.page +1) * 5),
                        meta : query.meta
                    };

                    return res.status(200).json(data);
                }
            } catch(error) {
                next(error);
            }         
        }
    }
}));

//@route GET api/invitations/:invitationId
//@desc GET single invitation by ID
//@access PRIVATE, only for owner of account with valid token
router.get('/:invitationId', auth, (req, res) => {
    const {id} = req.user;
    const invitationId = req.params.invitationId;
    
    if(id && invitationId && invitationId.match(/^[0-9a-fA-F]{24}$/)) {
        Invitation.findById(invitationId, (err, result) => {
            if(err) return res.status(500).json({message : err, status : '500', id : 'db_error'});

            if(result) {
                //user is not sender nor a receiver; return authorization error
                if(result.from !== id || result.to !== id) return res.status(401).json({message : 'User with provided ID is not allow to access resources other than his own', status : '401', id : 'user_access_denied'});
                
                const data = {
                    type : 'invitations',
                    invitationId : result.invitationId,
                    attributes : {
                        createdAt : result.createdAt,
                        from : result.from.email,
                        to : result.to.email,
                        conversationName : result.conversationName
                    },
                    links : {
                        all : '/api/invitations'
                    }
                };

                return res.status(200).json(data);
            } else {
                return res.status(404).json({message : 'Invitation with provided invitationId not found!', status : '404', id : 'invitation_not_found'});
            }
        });
    } else {
        return res.status(400).json({message : 'InvitationId has not been provided correctly', status : '400', id : 'invitationId_invalid'});
    }
});

//@route POST api/invitations
//@desc create new invitation
//@access PRIVATE, only for owner of account with valid token

router.post('/', auth, (req, res) => {
    
    const {name, to, invitationId} = req.body;
    const {id} = req.user;
    
    if(id && invitationId && typeof invitationId === 'string') {
        //valid authorization based on token id payload, provided invitationId
        User.findById(id)
            .then(user => {
                
                if(!user) return res.status(404).json({message : 'User with provided ID not found!', status : '404', id : 'user_not_found'});

                if(!user.isActive) return res.status(404).json({message : 'User with provided ID has not activated his/her account', status : '404', id : 'email_confirmation_false'});
                
                if(!to || typeof to !== 'string' || !utils.validateEmail(to)) return res.status(400).json({message : 'Invalid email address.', status : '400', id : 'email_invalid'});
                
                if(!name || typeof name !== 'string') return res.status(400).json({message : 'Invalid conversation name.', status : '400', id : 'conversation_name_invalid'});

                if(user.email === to) return res.status(400).json({message : 'Sender email equal with receiver email.', status : '400', id : 'sender_receiver_mail_equal'});
                
                User.findOne({email : to}, (err, result) => {
                    if(err) return res.status(500).json({message : error, status : '500', id : 'db_error'});

                    if(result) {
                        
                        const newInvitation = new Invitation({
                            from : {
                                id,
                                email : user.email
                            },
                            to : {
                                id : result.id,
                                email : result.email
                            },
                            invitationId,
                            conversationName : name
                        });
                        
                        newInvitation.save()
                            .then(result => {
                                if(result) {
                                    const data = {
                                        type  : 'invitations',
                                        invitationId : result.invitationId,
                                        attributes : {
                                            conversationName : result.conversationName,
                                            from : result.from.email,
                                            to : result.to.email,
                                            status : result.status
                                        },
                                        links : {
                                            self : `/api/invitations/${result._id}`
                                        }
                                    };
                                    
                                    return res.status(201).json(data);
                                }
                            })
                            .catch(error => res.status(500).json({message : error, status : '500', id : 'db_error'}))

                    } else {
                        return res.status(400).json({message : 'User with provided email not found!', status : '404', id : 'user_not_found'});
                    }
                });
            })
            .catch(error => res.status(500).json({message : error, status : '500', id : 'db_error'}))
    } else {
        //invitationId not present
        return res.status(400).json({message : 'Invalid InvitationId', status : '400', id : 'invitationId_invalid'});
    }
});

//@route PATCH api/invitations/:invitationId?status=x ("accepted" or "rejected")
//@desc create new invitation
//@access PRIVATE, only for owner of account with valid token

router.patch('/:invitationId', auth, (req, res) => {
    const {invitationId} = req.params;
    const {id} = req.user;
    const {status} = req.query;
    
    //check for auth id
    if(id) {
        let isQueryValid = status && typeof status === 'string' && (status === 'accepted' || status === 'rejected') ? true : false;

        if(!isQueryValid) return res.status(400).json({message : 'Bad Request. Please try again after modifying the current request', status : '400', id : 'bad_request'});

        if(invitationId && invitationId.match(/^[0-9a-fA-F]{24}$/)) {

            Invitation.findById(invitationId, (err, result) => {
                if(err) return res.status(500).json({message : err, status : '500', id : 'db_error'});
    
                if(result) {
                    //check if resource belongs to user && the user is a receiver
                    if(result.to.id.toString() !== id) return res.status(401).json({message : 'User with provided ID is not allowed to access resources other than his own', status : '401', id : 'user_access_denied'});

                    if(result.status !== 'pending') return res.status(404).json({message : 'Invitation has been already ' + result.status, status : '404', id : 'invitation_responded'});

                    result.status = status;

                    result.save()
                        .then( updatedInvitation => {
                            let data = [];

                            const invitationData = {
                                type  : 'invitations',
                                invitationId : updatedInvitation._id,
                                attributes : {
                                    conversationName : updatedInvitation.conversationName,
                                    from : updatedInvitation.from.email,
                                    to : updatedInvitation.to.email,
                                    status : updatedInvitation.status
                                },
                                links : {
                                    self : `/api/invitations/${updatedInvitation._id}`
                                }
                            };

                            if(updatedInvitation.status === 'accepted') {

                                data.push(invitationData);

                                //create new conversation doc if conversation has been accepted
                                const roomId = uniqid();

                                const newConversation = new Conversations({
                                    members : [
                                        {email : updatedInvitation.from.email, id : updatedInvitation.from.id},
                                        {email : updatedInvitation.to.email, id : updatedInvitation.to.id}
                                    ],
                                    roomId,
                                    conversationName : updatedInvitation.conversationName
                                });

                                newConversation.save()
                                    .then( conversation => {
                                        
                                        const conversationData = {
                                            type  : 'conversations',
                                            conversationId : conversation._id,
                                            attributes : {
                                                members : conversation.members,
                                                roomId : conversation.roomId,
                                                createdAt : conversation.createdAt,
                                                status : conversation.status,
                                                conversationName : conversation.converationName
                                            },
                                            links : {
                                                self : `/api/conversations/${conversation._id}`
                                            }
                                        };

                                        data.push(conversationData);

                                        return res.status(201).json(data);
                                        
                                    })
                                    .catch(err => res.status(500).json({message : err, status : '500', id : 'db_error'}));


                            } else return res.status(201).json(invitationData);
      
                        })
                        .catch(err => res.status(500).json({message : err, status : '500', id : 'db_error'}));

                } else {
                    return res.status(404).json({message : 'Invitation with provided invitationId not found!', status : '404', id : 'invitation_not_found'});
                }
            })

        } else {
            return res.status(400).json({message : 'InvitationId has not been provided correctly', status : '400', id : 'invitationId_invalid'});
        }
        
    }
});

module.exports = router;

