function room(id, par){
var self = this
var par = par

	this.id = id
	this.OBJECT_LIST = [];
	this.conditions = []
	
	for (var i in self.conditions){
		if (self.conditions[i]){
			delete par[self.id]
		}
	}

}

exports.room = room;