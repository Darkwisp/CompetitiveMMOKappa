function queue(id, par, gameMode, max){
	this.id = id
	this.par = par
	this.gameMode = gameMode
	this.USER_LIST = [];
	this.maxUsers = max
}

exports.queue = queue;