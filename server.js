var express = require('express');
var app = express();
var serv = require('http').Server(app);
var io = require('socket.io')(serv,{});

var SOCKET_LIST = {};
var QUEUE_LIST = [];
var ROOM_LIST = [];

//require classes!!!~

var room = require('./classes/room').room;
var player = require('./classes/player').player;
var queue = require('./classes/queue').queue;

app.use('/client',express.static(__dirname + '/client'));

app.get('/',function(req, res) {
    res.sendFile(__dirname + '/files/index.html');
});

app.get('/game',function(req, res) {
    res.sendFile(__dirname + '/files/game.html');
});

app.get('/signup',function(req, res) {
    res.sendFile(__dirname + '/files/sign.html');
});

var logserv = io.of('/login');
logserv.on('connection', function(socket){
socket.on('login', function(username, pass, email){
		console.log('shouldwork')
		console.log(username,pass,email);
		socket.emit('loginAccepted',username)
		socket.handshake.headers.username = username
	});	
});

var logserv = io.of('/signup');
logserv.on('connection', function(socket){
socket.on('signup', function(username, pass, email){
		console.log('shouldworksign')
		console.log(username,pass,email);
	});	
});

var gameserv = io.of('/game');
	gameserv.on('connection', function(socket){
		socket.id = Math.floor(Math.random())
		socket.roomid = 0;
		checkIfIDTaken(socket)
		
		function checkIfIDTaken(socket){
			if (SOCKET_LIST[socket.id]){
				socket.id = Math.floor(Math.random())
				checkIfIDTaken(socket)
			}
		}
		
		console.log(socket.handshake.headers.username +' has entered the game')
		
		socket.on('join', function(roomid){
			socket.roomid = roomid
			console.log(roomid);
		}); 	
	
});

var roomserv = io.of('/room');

roomserv.on('connection', function(){
	
});

function createRoom(queue){
	var room = new room(Math.floor(Math.random()), ROOM_LIST);
	checkIfIDTaken(room)
	
	if (queue){
		for (var q in queue.USER_LIST){
			var playr = new player;
			
			room[queue.USER_LIST[q].id].push(playr)
			io.emit('newRoom',roomid);
		}
	}
	
	function checkIfIDTaken(room){
			if (ROOM_LIST[room.id]){
				room.id = Math.floor(Math.random())
				checkIfIDTaken(room)
			}
	}
	
	ROOM_LIST.push(room)
	return room
}

setInterval(function(){
    var pack = [];
	
    for(var i in SOCKET_LIST){
		
		sock = SOCKET_LIST.filter( function(item){return (item.id == i);} );
		
		for (var o in ROOM_LIST[sock.roomid].OBJECT_LIST){
			pack.push({
				type : ROOM_LIST[sock.roomid].OBJECT_LIST[o].type,
				x : ROOM_LIST[sock.roomid].OBJECT_LIST[o].position.x,
				y : ROOM_LIST[sock.roomid].OBJECT_LIST[o].position.y,
				visEff : []
			});    
		}
		
		io.of('/game').emit('newPositions', pack);
		pack = [];
    }

},1000/25);

serv.listen(3000);