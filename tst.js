var express = require('express');
var app = express();
var serv = require('http').Server(app);
var io = require('socket.io')(serv,{});

var nsp = io.of('/my-namespace');
nsp.on('connection', function(socket){
  console.log('someone connected');
});
nsp.emit('hi', 'everyone!');

app.get('/',function(req, res) {
    res.sendFile(__dirname + '/files/index.html');
});


serv.listen(3000);