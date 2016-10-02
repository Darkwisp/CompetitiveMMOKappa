function telegraph(x, y, ori, ti, dur, cone){
	var self = this
	this.parent;
	this.type = 'Telegraph'
	
	this.x = x
	this.y = y
	
	this.isActivated = false
	
	this.actiTime = ti
	this.duration = dur
	
	this.orientation = ori
	this.coneAngle = cone
	
	this.coneMinRange = 0
	this.coneMaxRange = 30
	
	this.buffs = []
	
	this.deprecated = false
	
	this.Delete = function(){
		self.deprecated = true
	}
	 
	this.onActivation = function(quadtree, dmg){
		
	}
	
	this.onHit = function(obj,specAction){
		
		for (var i = 0; i < self.buffs.length; i ++){
			if(obj.buffs) {
				obj.addBuff (self.buffs[i],obj)
			}
		}
		if (specAction){
		specAction && specAction()
		}
	}

}