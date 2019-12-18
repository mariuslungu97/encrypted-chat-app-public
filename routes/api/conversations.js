const express = require('express');
const auth = require('../../middleware/auth');
const utils = require('../../utils');

const router = express.Router();

const Conversations = require('../../models/Conversations');

async function returnPageQuery(typeFc, page = 0, res, next) {
    let query;

    try {
        const docsCount = await Conversations.countDocuments(typeFc);

        if(docsCount) {
            let nrPages = Math.ceil(docsCount / 3);

            if(page <= nrPages - 1) {   
                //create query
                const without = {"members.id" : 0, _id : 0};

                query = Conversations.find(typeFc, without).sort({createdAt : 'desc'});

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
            return res.status(404).json({message : 'No conversations with specified type', status : '404', id : 'conversations_not_found'});
        }
    } catch(error) {
        next(error);
    };
};

const getType = (type = 'all') => {
    if(type === 'all') return {};
    else return {"status" : type};
};

//@route GET api/conversations
//@route GET api/conversations?page=m
//@route GET api/conversations?type=n
//@route GET api/conversations?page=m&type=n
//@desc get user conversations based on page and type query params, if provided. If not, get all conversations if count <= 3; else get first three conversations
//@access PRIVATE, only for owner of account with valid token

router.get('/', auth, utils.wrapAsync(async (req, res, next) => {
    //1. get encoded ID and query params, if any
    const {id} = req.user;
    const {page, type} = req.query;

    if(id) {
        //2. check if additional query params are valid
        let isPageParamValid, isTypeParamValid = null;
       
        if(page) !isNaN(+page) && page >= 0 ? isPageParamValid = true : isPageParamValid = false;

        if(type) typeof type === 'string' && (type === 'all' || type === 'active') ? isTypeParamValid = true : isTypeParamValid = false;
        
        const badRequestRes = {message : 'Bad Request. Please try again after modifying the current request', status : '400', id : 'bad_request'};

        if(isTypeParamValid === false || isTypeParamValid === false) return res.status(400).json(badRequestRes); 

        let query;

        const typeFc = isTypeParamValid ? getType(type) : getType(undefined);
        
        if(isPageParamValid) query = await returnPageQuery(typeFc, page, res, next);

        else query = await returnPageQuery(typeFc, undefined, res, next);

        if(query.query && query.meta) {
            try {
                const conversationData = await query.query.exec();

                if(conversationData) {
                    
                    const data = {
                        type : 'conversations',
                        data : conversationData.slice(query.meta.page * 3, (query.meta.page +1) * 3),
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

module.exports = router;

