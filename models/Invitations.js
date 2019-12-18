const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/*
    Invitation Example:
    {
        from : '5db4a8c346205129408e6174',
        to : 's932mbowc346205129408e6174',
        createdAt : 15:26 - 16/10/2019,
        status : 'pending' (default),
        id,
        userId (assigned for client-side manipulations),
        conversationName : 'SecretConv1'
    }
    status property values:
        1. pending (default) - String
        2. accepted - String
        3. rejected - String
*/

const invitationSchema = new Schema({
    from : {
        type : {},
        required : true
    },
    to : {
        type : {},
        required : true
    },
    createdAt : {
        type : Date,
        default : Date.now
    },
    status : {
        type : String,
        default : 'pending',
        enum : ['pending', 'accepted', 'rejected']
    },
    invitationId : {
        type : String,
        required : true
    },
    conversationName : {
        type : String,
        required : true
    }
});

module.exports = Invitation = mongoose.model('Invitation', invitationSchema);