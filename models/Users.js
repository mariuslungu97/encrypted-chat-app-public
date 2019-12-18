const mongoose = require('mongoose');

const Schema = mongoose.Schema;

/*
    User Example:
    {
        email : 'mariuslungu9722@gmail.com',
        password : 'sdmasjreu23259423ufdsjfs711xx' (hashed)
        createdAt : 19:23 - 15/10/2019,
        userId : '232131disudshdw&&121312',
        isActive : true,
        isTwoFactorActive : true,
        twoFactor : {
            tempSecret : 'xyz'
            secret : 'xyz'
        }
    }
*/

const userSchema = new Schema({
    
    email : {
        type : String,
        required : true,
        unique : true
    },
    password : {
        type : String,
        required : true
    },
    createdAt : {type : Date, default: Date.now},
    userId : {
        type : String,
        required : true,
        unique : true
    },
    isActive : {
        type : Boolean,
        default : false
    },
    isTwoFactorActive : {
        type : Boolean,
        default : false
    },
    twoFactorTempSecret : {
        type : String,
        default : ''
    },
    twoFactorSecret : {
        type : String,
        default : ''
    }
});

module.exports = User = mongoose.model('User',userSchema);