const mongoose = require('mongoose');

const Schema = mongoose.Schema;

/*
    Conversation Example:
    {
        members : [
            {id : 'xy3131a$$', email : 'mariuslungu9722@gmail.com}
            {id : 'xy3131a$$', email : 'mariuslungu9722@gmail.com}
        ],
        status : 'active',
        createdAt : 15:26 - 16/10/2019,
        roomId : 'a8c346205129408e6174',
        conversationName : 'MyConversation'
    }
*/

const conversationsSchema = new Schema({
    status : {
        type : String,
        default : 'active',
        enum : ['active', 'inactive']
    },
    createdAt : {
        type : Date,
        default : Date.now
    },
    roomId : {
        type : String,
        required : true
    },
    members : {
        type : Array,
        required : true,
        default : []
    },
    conversationName : {
        type : String,
        required : true
    }
});

module.exports = Conversations = mongoose.model('Conversation',conversationsSchema);