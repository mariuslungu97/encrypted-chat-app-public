const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/* 
    EmailVerification Example:
    {
        userId: 2313-4342-xafs-1acff-111a,
        rand : 313159623910
    }
*/

const emailVerificationSchema = new Schema({
    userId : {
        type : String,
        required : true
    },
    rand : {
        type : String,
        required : true,
        unique : true
    }
});

module.exports = EmailVerification = mongoose.model('EmailVerification',emailVerificationSchema);