const express = require('express');
const http = require('http');
const app = express();
const server = http.createServer(app);
const socket = require('socket.io');
const { pathToFileURL } = require('url');
const io = socket(server);

const rooms = {};

// Connection when a person connects to the app 
// Generating the socket
io.on('connection', socket => {
    // event listenet for someone joining a room
    socket.on('join room', roomID => {
        //if the room already exists in the room collection
        if(rooms[roomID]){
            //push this user to it
            rooms[roomID].push(socket.id);
        } else {
            // if not create that room and add the user to it
            rooms[roomID] = [socket.id];
        }
        // check if there is another user in the room
        const otherUser = rooms[roomID].find(id => id !== socket.id);
        if(otherUser){
            socket.emit('other user', otherUser);
            // notify the other user that this user joined
            socket.to(otherUser).emit('user joined', socket.id);
        }
    })

    // sending a payload to other user
    socket.on('offer', payload => {
        // payload.target is the user to send
        io.to(payload.target).emit('offer', payload); 
    })

    // answering to a user
    socket.on('answer', payload => {
        // payload.target is the user to send
        io.to(payload.target).emit('answer', payload);
    })
    // for both parties candidate election, to handshake
    socket.on('ice-candidate', incoming => {
        io.to(incoming.target).emit('ice-candidate', incoming.candidate);
    })
})



server.listen(8000, () => console.log('Server listening on port: 8000'));