//10.242.252.43
//10.242.224.50

var express = require('express');
var app = express();
var serv = require('http').Server(app);
var io = require('socket.io')(serv,{});

var SOCKET_LIST = [];
var QUEUE_LIST = [];
var ROOM_LIST = [];

//require classes!!!~

var room = require('./classes/room').room;
var player = require('./classes/player').player;
var queue = require('./classes/queue').queue;

var mainRoom = createRoomByID(0)

//var mocPlayer = new player(3, 'Hey that\'s pretty good', 1, 0, 1, 4, 4);
//mainRoom.OBJECT_LIST.push(mocPlayer)

app.use(express.static(__dirname + '/files'));

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
		checkIfIDTaken(socket);
		
		SOCKET_LIST.push(socket);
		
			var localPlayer = new player(socket.id, socket.handshake.headers.username, 0, 0, 0, 4, 4);
			
			ROOM_LIST[socket.roomid].OBJECT_LIST.push(localPlayer)	
			socket.on('press', function(b){
				if (b == localPlayer.controls[0].code){
					localPlayer.vel.z = -0.5
				} else if (b == localPlayer.controls[1].code){
					localPlayer.vel.z = +0.5
				} else if (b == localPlayer.controls[2].code){
					localPlayer.vel.x = -.5
				} else if (b == localPlayer.controls[3].code){
					localPlayer.vel.x = +0.5
				}
			});
			
			socket.on('release', function(b){
				if (b == localPlayer.controls[0].code){
					localPlayer.vel.z = 0
				} else if (b == localPlayer.controls[1].code){
					localPlayer.vel.z = 0
				} else if (b == localPlayer.controls[2].code){
					localPlayer.vel.x = 0
				} else if (b == localPlayer.controls[3].code){
					localPlayer.vel.x = -0
				}
			});
			
		socket.on('disconnect',function(){
			delete SOCKET_LIST[socket.id];
			ROOM_LIST[socket.roomid].OBJECT_LIST.splice(localPlayer)
		});
	
		function checkIfIDTaken(sock){
			if (SOCKET_LIST.filter( function(item){return item.id = socket.id})[0]){
				socket.id = Math.floor(Math.random())
				
				checkIfIDTaken(sock)
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
	var newRoom = new room(Math.floor(Math.random()), ROOM_LIST);
	checkIfIDTaken(room)
	
	if (queue){
		for (var q in queue.USER_LIST){
			var playr = new player;
			
			room[queue.USER_LIST[q].id].push(playr)
			io.emit('newRoom',roomid);
		}
	}
	
	function checkIfIDTaken(room){
			if (ROOM_LIST.filter( function(item){return item.id = room.id})[0]){
				room.id = Math.floor(Math.random())
				checkIfIDTaken(room)
			}
	}
	
	ROOM_LIST[newRoom.id] = newRoom
	return newRoom
}

function createRoomByID(id){
	var newRoom = new room(id, ROOM_LIST);
	
	ROOM_LIST[id] = newRoom
	return newRoom
}

setInterval(function(){
    var pack = [];
	
    for(var i in SOCKET_LIST){
		
		var sock = SOCKET_LIST[i]
		
		
		if (ROOM_LIST[sock.roomid]){
			
			var sockPlayer = ROOM_LIST[sock.roomid].OBJECT_LIST.filter( function(item){return (item.id==sock.id);})[0]
			if (sockPlayer){
				pack.push({
					type :  sockPlayer.type,
					name : sockPlayer.name,
					x : sockPlayer.pos.x,
					y : sockPlayer.pos.y,
					z : sockPlayer.pos.z,
					visEff : []
				}); 
			}
						
			for (var o in ROOM_LIST[sock.roomid].OBJECT_LIST){			
				
				if (ROOM_LIST[sock.roomid].OBJECT_LIST[o].name && ROOM_LIST[sock.roomid].OBJECT_LIST[o].name == sockPlayer.name){
					
				}else{
					pack.push({
						type : ROOM_LIST[sock.roomid].OBJECT_LIST[o].type,
						name : ROOM_LIST[sock.roomid].OBJECT_LIST[o].name,
						x : ROOM_LIST[sock.roomid].OBJECT_LIST[o].pos.x,
						y : ROOM_LIST[sock.roomid].OBJECT_LIST[o].pos.y,
						z : ROOM_LIST[sock.roomid].OBJECT_LIST[o].pos.z,
						visEff : []
					});    
					}
				}
				console.log(pack[0])
				io.of('/game').emit('newPositions', pack);
				pack = [];
		}	
    }
	
	for (var i in ROOM_LIST){
		for (var o in ROOM_LIST[i].OBJECT_LIST){
			
			if (ROOM_LIST[i].OBJECT_LIST[o]){
				
				//console.log(ROOM_LIST[i].OBJECT_LIST[o].vel.x)
				
				ROOM_LIST[i].OBJECT_LIST[o].pos.x += ROOM_LIST[i].OBJECT_LIST[o].vel.x
				ROOM_LIST[i].OBJECT_LIST[o].pos.y += ROOM_LIST[i].OBJECT_LIST[o].vel.y
				ROOM_LIST[i].OBJECT_LIST[o].pos.z += ROOM_LIST[i].OBJECT_LIST[o].vel.z
				
				//console.log(ROOM_LIST[i].OBJECT_LIST[o].name)
			}
			
		}
	}

},1000/30);

serv.listen(3000);