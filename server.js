const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const jwtSecret = require('./config/keys').jwtSecret;
const fs = require('fs');
const https = require('https');
const privateKey = fs.readFileSync('./key.pem');
const certificate = fs.readFileSync('./cert.pem');
let io = require('socket.io');

//create express app
const app = express();

//use bodyparser middleware that parses JSON
app.use(express.json());

const db = require('./config/keys').mongoURI;
const users = require('./routes/api/users');
const verify = require('./routes/api/verify');
const auth = require('./routes/api/auth');
const invitations = require('./routes/api/invitations');
const twofactor = require('./routes/api/twofactor');
const conversations = require('./routes/api/conversations');

const Conversations = require('./models/Conversations');

//connect to Mongo DB
mongoose.connect(db, {
        useNewUrlParser : true,
        useCreateIndex : true,
        useUnifiedTopology : true
    })
    .then(() => console.log('MongoDB is connected'))
    .catch(error => console.error(error));

const port = process.env.PORT || 5000;

const options = {key : privateKey, cert : certificate};

const httpsServer = https.createServer(options, app);

//bind server to port
httpsServer.listen(port, () => console.log(`Server started on port: ${port}`));

io = io(httpsServer);

//Allow CORS from diff domains, allow all types of headers, and allow certain HTTP Methods (see below)
app.use((req, res, next) => {
   res.header('Access-Control-Allow-Origin', '*');
   res.header('Access-Control-Allow-Headers', '*'); 

   if(req.method === 'OPTIONS') {
       res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE');
       return res.status(200).json({});
   };

   console.info(`${req.method} ${req.originalUrl}`);

   next();
});

//Routes
app.use('/api/users',users);
app.use('/api/verify',verify);
app.use('/api/auth', auth);
app.use('/api/invitations', invitations);
app.use('/api/twofactor', twofactor);
app.use('/api/conversations', conversations);

//Middleware to handle requests which were not "caught" by the already setup routes - see above
app.use((req, res, next) => {
    const error = new Error('Specified route not found!');
    error.status = 404;
    error.id = 'route_not_found';
    next(error);
});

//Middleware for all incoming requests with an error
app.use((error, req, res, next) => {
    res.status(error.status || 500);
    console.log(error.stack);
    res.json({
        
        message : error.message,
        status : error.status,
        id : error.id
        
    });
});

io
.use((socket, next) => {
    //verify token on connection
    if(socket.handshake.query && socket.handshake.query.token) {
        jwt.verify(socket.handshake.query.token, jwtSecret, (err, user) => {
            if(err) return next(new Error('Authentication Error'));
            socket.user = user;
            next();
        });
    } else {
        next(new Error('Authentication Error'));
    }
})
.on('connection', (socket) => {
    //id of the new connected user
    const {id} = socket.user;

    console.log(`User Connected - Socket ID: ${socket.id}; User Id: ${id}`);
    //"join" event listener, triggered by the client; returns callback
    socket.on('join', (data, callback) => {
        
        const {roomName, token, email, timestamp, key} = data;

        if(token) {
            //verify token once more for JOIN
            jwt.verify(token, jwtSecret, (err, user) => {

                if(err) return new Error('Authentication Error');

                
                const responseData = {
                    'INTRUSION_ATTEMPT' : {type : 'error', timestamp, email, message : 'Room is full. Room capacity no more than two users', id : 'ROOM_FULL'},
                    'IS_ALREADY_JOINED' : {type : 'error', timestamp, email, message : `${email} is already joined in ${roomName}`, id : 'IS_ALREADY_JOINED'},
                    'USER_DISCONNECTED' : {type : 'status', timestamp, email, message : `${email} has disconnected.`, id : 'USER_DISCONNECTED'},
                    'NEW_CONNECTION' : {type : 'status', key, timestamp, email, currentRoom : roomName, message : `${email} has connected.`, id : 'NEW_CONNECTION'},
                    'JOIN_NOT_ALLOWED' : {type : 'error', timestamp, email, message : `${email} is not allowed to join the conversation`, id : 'JOIN_NOT_ALLOWED'},
                    'DB_ERROR' : {type : 'error', timestamp, id : 'DB_ERROR'},
                    'ROOM_NOT_FOUND' : {type : 'error', timestamp, roomName, message : `room with id: ${roomName} not found in the DB`, id : 'ROOM_NOT_FOUND'}
                }

                //room reference
                let room = io.sockets.adapter.rooms[roomName];

                if(user.id && room && room.length > 1) {
                    const response = 'INTRUSION_ATTEMPT';
                    //room is full, reject join attempt
                    callback(responseData[response]);
                    
                    io.sockets.in(roomName).emit(response, responseData[response]); //emit INTRUSION_ATTEMPT to sockets in room
                
                } else if(user.id && room && room.length === 1) {

                    //is user already joined in the same room?
                    if(socket.currentRoom && socket.currentRoom === roomName) {
                        const response = 'IS_ALREADY_JOINED';

                        return callback(responseData[response]);
                    }

                    //isAllowed to participate in the convo?
                    //room.users contains the IDs of the members that are allowed to join the room (the ones that created the convo)
                    const isAllowed = room.users.find(allowedId => allowedId === user.id);
                    
                    if(isAllowed) {
                        //does the socket currently belong to a room?
                        if(socket.currentRoom) {
                            const response = 'USER_DISCONNECTED';
                            
                            console.log(`User is disconnecting from a room: email: ${email}; room: ${socket.currentRoom}`)

                            socket.leave(socket.currentRoom);
    
                            socket.broadcast.to(socket.currentRoom).emit(response, responseData[response]);
                        };

                        const response = 'NEW_CONNECTION';

                        socket.currentRoom = roomName;
    
                        socket.join(socket.currentRoom);

                        callback(socket.currentRoom);
            
                        socket.broadcast.to(socket.currentRoom).emit(response, responseData[response]);
    
                    } else io.to(socket.id).emit('JOIN_NOT_ALLOWED', responseData['JOIN_NOT_ALLOWED']);
                //no one has joined the room yet
                } else if( user.id ){
                    
                    Conversations.findOne({roomId : roomName}, (err, conversation) => {
                        
                        if(err) {
                            const response = 'DB_ERROR';
                            const responseRec = {...responseData[response]};
                            responseRec.message = err;
                            io.to(socket.id).emit(response, responseRec);
                        } 
        
                        if(conversation) {
                            
                            //get roomID's and check if id exists in arr
                            const membersId = conversation.members.map(member => member.id);
        
                            const isAllowed = membersId.find(memberId => memberId === user.id);
        
                            if(isAllowed) {
                                // Leave current room
                                if(socket.currentRoom) {

                                    const response = 'USER_DISCONNECTED';

                                    socket.leave(socket.currentRoom);

                                    socket.broadcast.to(socket.currentRoom).emit(response, responseData[response]);

                                }
                                
                                const response = 'NEW_CONNECTION';

                                socket.currentRoom = roomName;

                                socket.join(socket.currentRoom);
        
                                io.sockets.adapter.rooms[socket.currentRoom].users = membersId;

                                // Notify user of room join success
                                callback(responseData[response]);

                                // Notify room that user has joined
                                socket.broadcast.to(socket.currentRoom).emit(response, responseData[response])

                            } else io.to(socket.id).emit('JOIN_NOT_ALLOWED', responseData['JOIN_NOT_ALLOWED']);
        
                        } else io.to(socket.id).emit('ROOM_NOT_FOUND', responseData['ROOM_NOT_FOUND']);
                    })
                }
            })
        } else new Error('Authentication Error');


        
    });

    socket.on('NEW_MESSAGE', (data, callback) => {

        const {message, email, timestamp} = data;

        console.log(`New Message: ${message} || ${email} || ${timestamp}`);

        const responseData = {
            'NEW_MESSAGE' : {type : 'message', email, message, timestamp, id : 'NEW_MESSAGE'},
            'USER_NOT_JOINED' : {type : 'error', timestamp, email, message : `${email} is not joined to any room.`, id : 'USER_NOT_JOINED'}
        };

        console.log(socket.currentRoom);

        if(socket.currentRoom) {

            const response = 'NEW_MESSAGE';

            socket.broadcast.to(socket.currentRoom).emit(response, responseData[response]);

            callback(responseData[response]);

        } else callback(responseData['USER_NOT_JOINED']);

    });

    socket.on('IS_TYPING', (data, callback) => {

        const {email, timestamp, isTyping} = data;

        const message = isTyping ? `${email} is currently typing!` : '';

        const responseData = {
            'IS_TYPING' : {type : 'status', isTyping, email, timestamp, message, id : 'IS_TYPING'},
            'USER_NOT_JOINED' : {type : 'error', email, timestamp, message : `${email} is not joined to any room.`, id : 'USER_NOT_JOINED'}
        };

        if(socket.currentRoom) {

            const response = 'IS_TYPING';

            socket.broadcast.to(socket.currentRoom).emit(response, responseData[response]);

        } else callback(responseData['USER_NOT_JOINED']);

    });

    socket.on('error', err => console.log(err));

    socket.on('request_disconnect', () => {
        console.log(`User is disconnecting- ${socket.id}`);
        socket.disconnect(true);
    });

    socket.on('PUBLIC_KEY', (data, callback) => {

        const {email, key} = data;

        console.log(`${email} is sending the key`);

        const responseData = {
            'PUBLIC_KEY' : {type : 'status', email, key, id : 'PUBLIC_KEY'},
            'USER_NOT_JOINED' : {type : 'error', email, message : `${email} is not joined to any room.`, id : 'USER_NOT_JOINED'}
        }

        if(email && key && socket.currentRoom) socket.broadcast.to(socket.currentRoom).emit('PUBLIC_KEY', responseData['PUBLIC_KEY']);

        else callback(responseData['USER_NOT_JOINED']);
    });

});









