const path = require('path');
const express = require('express');

const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);

const clients = [];

const port = process.env.PORT || 3000;

if(port !== 3005) {
  app.use(express.static(path.join(__dirname, 'build')));
  app.get('/', function(req, res){
    res.sendFile(__dirname + '/build/index.html');
  });
}

io.on('connection', function(socket){
  clients.push(socket);

  io.emit('message', {
    type: 'clientsLength',
    payload: clients.length
  });

  socket.on('disconnect', function(){
    clients.splice(clients.indexOf(socket), 1);
    io.emit('message', {
      type: 'clientsLength',
      payload: clients.length
    });
  });

  socket.on('chat:message', function(msg){
    socket.broadcast.emit('message', {
      type: 'message',
      payload: msg
    })
  });
});

http.listen(port, () => {
  console.log(`Listening on port: ${port}`);
});