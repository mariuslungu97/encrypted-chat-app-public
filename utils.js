const from = require('./config/keys').gmailUser;

//validate email function
const validateEmail = (email) => {
    const regex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return regex.test(String(email).toLowerCase());
};

//validate password function
const validatePassword = (password) => {
    let response = [];

    if(password.length < 8) response.push('Your password is too short.');
    if(password.length > 20) response.push('Your password is too long.');
    if(password.search(/\d/) == -1) response.push('Your password must contain at least one digit.');
    if(password.search(/[a-z]/i) < 0) response.push('Your password must contain at least one letter.');

    return response;
};

//custom mailOptions object, based on provided receiver and link
const customMailOptions = (to, link) => {
    return {
        from,
        to,
        subject : 'Please Verify Your Email Account',
        html : `
            Hi There,
            <br>Please click on the following link to verify your email address:<br>
            <a href="${link}">Click here to verify your mail address</a>
            <br>
            Best regards,
            <br>
            EncryptedChat Team
        `
    };
};

//catch wrapper for async function in routes
function wrapAsync(fn) {
    return function(req, res, next) {
        fn(req, res, next).catch(next);
    };
};

module.exports = {
    validateEmail,
    validatePassword,
    customMailOptions,
    wrapAsync
};