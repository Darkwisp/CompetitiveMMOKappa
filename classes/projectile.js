function projectile(x, y, dmg, mH){
	var self = this
	this.parent;
	this.type = 'Projectile'
	
	this.bulletSpeed = 10
	this.damage = dmg
	this.deprecated = false
	
	this.homing = false
	this.target;
	
	this.pos = {x:x, y:y, z:z}
	this.vel = {x:'', y:'', z:''}
	this.acc = {x:0, y:0, z:0}
	this.siz = {x:20, y:20, z:20}
	
	this.maxHit = mH
	this.targetsHit = 0
	
	this.Delete = function(){
		if (self.parent) {
			self.deprecated = true
			self.parent.splice(self)
		}
	}
	
	this.onHit = function(obj, specAction){
		
		self.targetsHit += 1
		
		for (var i = 0; i < buffs.length; i ++){
			if(obj.buffs) {
				obj.addBuff (buffs[i],obj)
			}
			
			if (obj.health) {
				obj.TakeDamage(self.damage)
			}
			
		}
		
		if (self.targetsHit >= self.maxHit){
			self.Delete()
		}
		
		if (specAction){
		specAction && specAction()
		}
	}
	
}