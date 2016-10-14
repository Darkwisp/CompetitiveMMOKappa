//10.242.252.43

var express = require('express');
var app = express();
var serv = require('http').Server(app);
var io = require('socket.io')(serv,{});
var math = require('mathjs');

var SOCKET_LIST = {};
var PLAYER_LIST = {};
var QUEUE_LIST = [];
var ROOM_LIST = [];

//require classes!!!~

var three = require('three');

var room = require('./classes/room').room;
var player = require('./classes/player').player;
var queue = require('./classes/queue').queue;

var mainRoom = createRoomByID(0)
mainRoom.setFaces('./maps/samplePlanet.json')

var events = require('events');

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
		socket.id = Math.random()
		socket.roomid = 0;
		checkIfIDTaken(socket);
		
		SOCKET_LIST[socket.id] = socket;
		
			var localPlayer = new player(socket.id, socket.handshake.headers.username, 0, 0, 0, 4, 4);
			
			ROOM_LIST[socket.roomid].OBJECT_LIST.push(localPlayer)
			
			socket.on('press', function(b){
				if (b == localPlayer.controls[0].code){
					localPlayer.vel.z = 0.5
				} else if (b == localPlayer.controls[1].code){
					localPlayer.vel.z = -0.5
				} else if (b == localPlayer.controls[2].code){
					localPlayer.vel.x = +1
				} else if (b == localPlayer.controls[3].code){
					localPlayer.vel.x = -1
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
			ROOM_LIST[socket.roomid].OBJECT_LIST.splice(ROOM_LIST[socket.roomid].OBJECT_LIST.filter(function(obj){
				return obj.id == socket.id
			})[0])
			delete SOCKET_LIST[socket.id]
			delete socket.handshake.headers.username
		});
	
		function checkIfIDTaken(sock){
			if (SOCKET_LIST[sock]){
				socket.id = Math.random()
				
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
	var max = 1000
	var min = 1
	var newRoom = new room(Math.floor(Math.random()) * (max - min) + min , ROOM_LIST);
	
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
				room.id = Math.floor(Math.random() * (max - min) + min)
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
						
			for (var o in ROOM_LIST[sock.roomid].OBJECT_LIST){			
				
				if (sockPlayer && ROOM_LIST[sock.roomid].OBJECT_LIST[o] == sockPlayer){
					
					pack.push({
						type :  sockPlayer.type,
						name : sockPlayer.name,
						x : sockPlayer.pos.x,
						y : sockPlayer.pos.y,
						z : sockPlayer.pos.z,
						visEff : [],
						isPlayer : true
					});
					
				}else{
					pack.push({
						type : ROOM_LIST[sock.roomid].OBJECT_LIST[o].type,
						name : ROOM_LIST[sock.roomid].OBJECT_LIST[o].name,
						x : ROOM_LIST[sock.roomid].OBJECT_LIST[o].pos.x,
						y : ROOM_LIST[sock.roomid].OBJECT_LIST[o].pos.y,
						z : ROOM_LIST[sock.roomid].OBJECT_LIST[o].pos.z,
						oriy : ROOM_LIST[sock.roomid].OBJECT_LIST[o].ori.y,
						visEff : []
					});    
					}
				}
				//console.log(pack[0])
				SOCKET_LIST[i].emit('newPositions', pack);
				
				//io.of('/game').emit('newPositions', pack);
				pack = [];
		}
    }
	
	for (var i in ROOM_LIST){
		for (var o in ROOM_LIST[i].OBJECT_LIST){
			
			if (ROOM_LIST[i].OBJECT_LIST[o]){
				
				obj = ROOM_LIST[i].OBJECT_LIST[o]
				//console.log(ROOM_LIST[i].OBJECT_LIST[o].vel.x)
				
				obj.pos.x += obj.vel.x
				obj.pos.y += obj.vel.y
				obj.pos.z += obj.vel.z
				
				var currFaces = []
				var currVertices = []
				
				var closestFace = {}
				var closestDist = 9007199254740992
				function face(){
					this.vertices = [];
				}
				var offset = 0
				
				for (var t in ROOM_LIST[i].threeGeometry){
					var totVert = -1
					
					for (var f in ROOM_LIST[i].threeGeometry[t].faces){
						
						currFaces.push(ROOM_LIST[i].threeGeometry[t].faces[f])
						
						currFaces[currFaces.length-1].a  += offset
						currFaces[currFaces.length-1].b  += offset
						currFaces[currFaces.length-1].c  += offset
						
					}
					
					for (var v in ROOM_LIST[i].threeGeometry[t].vertices){
						currVertices.push(ROOM_LIST[i].threeGeometry[t].vertices[v])
						totVert += 1
					}
					
					offset += totVert
					
				}
				
				for (var f in currFaces){
					var aA = currFaces[f].a
					var bB = currFaces[f].b
					var cC = currFaces[f].c
					
					var p1 = Object.keys(currVertices[aA].position).map(function (key) { return currVertices[aA].position[key]; });
					var p2 = Object.keys(currVertices[bB].position).map(function (key) { return currVertices[bB].position[key]; });
					var p3 = Object.keys(currVertices[cC].position).map(function (key) { return currVertices[cC].position[key]; });
					
					var ori = math.mean([p1,p2,p3],0)
					
					var dir = math.cross(math.subtract(p2,p1), math.subtract(p3,p1))
					var dirMag = Math.sqrt( (dir[0]*dir[0]) + (dir[1]*dir[1]) + (dir[2]*dir[2]) )
					dir = math.divide(dir, dirMag)
					
					var desiredPoint = [obj.pos.x,  obj.pos.y,  obj.pos.z]
					
					var d = math.multiply(dir, ori)//math.dot(v,dir)
					var dist = math.dot(dir,desiredPoint) + d
					
					if (closestDist > Math.abs(dist)){
						closestDist = dist
						closestFace = currFaces[f]
					}
				}
				
				if (closestFace){
					
					var aA = closestFace.a
					var bB = closestFace.b
					var cC = closestFace.c
					
					var p1 = Object.keys(currVertices[aA].position).map(function (key) { return currVertices[aA].position[key]; });
					var p2 = Object.keys(currVertices[bB].position).map(function (key) { return currVertices[bB].position[key]; });
					var p3 = Object.keys(currVertices[cC].position).map(function (key) { return currVertices[cC].position[key]; });
					
					var ori = math.mean([p1,p2,p3],0)
					
					var dir = math.cross(math.subtract(p2,p1), math.subtract(p3,p1))
					var dirMag = Math.sqrt( (dir[0]*dir[0]) + (dir[1]*dir[1]) + (dir[2]*dir[2]) )
					dir = math.divide(dir, dirMag)
					
					var desiredPoint = [obj.pos.x,  obj.pos.y,  obj.pos.z]
					
					var d = math.multiply(dir, ori)//math.dot(v,dir)
					var dist = math.dot(dir,desiredPoint) + d
					
					var projPoint = math.subtract(desiredPoint, math.multiply(dist,dir))
					
					var projMag = Math.sqrt( (projPoint[0]*projPoint[0]) + (projPoint[1]*projPoint[1]) + (projPoint[2]*projPoint[2]) )
					var projDir = math.divide(projPoint, projMag)
					
					console.log(projPoint)
					
				}

			}
			
		}
	}

},1000/30);

serv.listen(3000);