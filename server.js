const path = require('path');
const http = require('http');
const express = require('express');

const socketio = require('socket.io');

const formatMessage = require('./utils/messages');

// const mongo = require('mongodb').MongoClient;
const {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers,
  uniqueUser,
} = require('./utils/users');

const app = express();

// Connecting to Mongo
//mongo.connect('mongodb://')

//For accessing server directly for socket.io
const server = http.createServer(app);

const io = socketio(server);

app.use(express.static(path.join(__dirname, 'public')));

const botName = 'Mercury Bot';

// RUNS WHEN CLIENT CONNECTS

//io.on will listen for any event
io.on('connection', (socket) => {
  // check user is unique
  // socket.on('newUser', (username,room) => {
  //   if (!uniqueUser(username,room)) {
  //     console.log('Username checks out! Welcome');
  //     // user is unique
  //     socket.emit('uniqueUser');
  //   } else {
  //     console.log('Sorry, username is already in use');
  //     socket.emit('duplicateUser');
  //   }
  // });

  socket.on('joinRoom', ({ username, room }) => {
    const user = userJoin(socket.id, username, room);
    socket.join(user.room);
    // Welcome current user
    socket.emit('message', formatMessage(botName, 'Welcome to Mercury ChatRoom!'));

    // Broadcast to all connections except the current connection joining
    socket.broadcast
      .to(user.room)
      .emit(
        'message',
        formatMessage(botName, `${user.username} has joined the chat`)
      );
 
    // Send users and room info
    io.to(user.room).emit('roomUsers', {
      room: user.room,
      users: getRoomUsers(user.room),
    });
  });

  // Listen for chat messages
  socket.on('chatMessage', (msg) => {
    const user = getCurrentUser(socket.id);
    io.to(user.room).emit('message', formatMessage(user.username, msg));
  });

  // User disconnecting
  socket.on('disconnect', () => {
    const user = userLeave(socket.id);
    if (user) {
      io.to(user.room).emit(
        'message',
        formatMessage(botName, `${user.username} has left the chat`)
      );

      // Send users and room info
      io.to(user.room).emit('roomUsers', {
        room: user.room,
        users: getRoomUsers(user.room),
      });
    }
  });
});
const PORT = process.env.PORT || 4000;

server.listen(PORT, () => console.log(`Server running on port: ${PORT}`));