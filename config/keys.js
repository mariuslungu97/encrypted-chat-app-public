//place to store all config keys (mongoURI connection, gmail)
/*
    Place to store all config keys:
        1. mongoURI - URI use to connect to a MongoDB cluster. Go to "https://www.mongodb.com/cloud/atlas" to create free acount
        2. gmailUser, gmailPass - valid GMail account details used by server to send mails to newly registered users
        3. jwtSecret - secret used by JWT to sign tokens
*/
module.exports = {
    mongoURI : '',
    gmailUser : '',
    gmailPass : '',
    jwtSecret : ''
};