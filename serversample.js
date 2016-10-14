var express = require('express');
var app = express();
var serv = require('http').Server(app);
 
app.get('/',function(req, res) {
    res.sendFile(__dirname + '/client/index.html');
});
app.use('/client',express.static(__dirname + '/client'));
 
serv.listen(3000);
console.log("Server started.");
 
var SOCKET_LIST = {};
var PLAYER_LIST = {};

function Player (id){
	this.x = 250
	this.y = 250
	this.id = 250
	this.xvel = 0
	this.yvel = 0
}
 
var io = require('socket.io')(serv,{});
io.sockets.on('connection', function(socket){
    socket.id = Math.random();
    SOCKET_LIST[socket.id] = socket;
	
	var player = new Player(socket.id);
	PLAYER_LIST[socket.id] = player
 
    socket.on('disconnect',function(){
        delete SOCKET_LIST[socket.id];
		delete PLAYER_LIST[socket.id];
    });
	
   socket.on('move', function(dir){
    console.log('Player moved ' + dir);
	player.yvel = 3
  });
  
  
});
 
setInterval(function(){
    var pack = [];
	
    for(var i in SOCKET_LIST){
        var player = PLAYER_LIST[i];
        pack.push({
            x:player.x,
            y:player.y,
        });    
    }
    for(var i in SOCKET_LIST){
        var player = PLAYER_LIST[i];
		
		player.x +=  player.xvel;
        player.y += player.yvel;
		
        io.emit('newPositions',pack);
    }
},1000/25);