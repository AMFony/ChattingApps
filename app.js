const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const SocketIOFileUpload = require('socketio-file-upload');
const { Server } = require("socket.io");
const io = new Server(server);
const { v4: uuidv4 } = require('uuid');
const { Socket } = require('net');
const { event } = require('jquery');


app.use(SocketIOFileUpload.router).use(express.static(__dirname));

var users = [];
var ext= '';
io.on('connection', socket => {
  var uloader = new SocketIOFileUpload();
  uloader.dir = "./uploads";
  uloader.listen(socket);
  console.log('new user connected');

  socket.on('join', name => {
    users.push(name);
    socket.username = name;
    socket.emit('joinsuccess', name);
    io.emit('updateusers', users);
  });
  socket.on('send', m => {

    socket.broadcast.emit('message', { from: socket.username, msg: m })
  });
  socket.on('disconnect', () => {
    

    var i = users.indexOf(socket.username);
    users.splice(i, 1);
    io.emit('updateusers', users);
  });

  uloader.on('start', event => {
    var old_name = event.file.name
		var arr = old_name.split('.');
    ext = arr[arr.length - 1]
    var new_name = uuidv4() + '.' + arr[arr.length - 1];
    return event.file.name = new_name;
  });
  uloader.on('saved', event => {
    io.emit('uploadsuccess', { from: socket.username, file: event.file.name, extension:ext });
  });
})
server.listen(8015, () => {
  console.log('listening on http://localhost:8015');
});
