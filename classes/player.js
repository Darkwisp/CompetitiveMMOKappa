function player(id, name, x, y, z, hp, en){
	var self = this
	this.parent;
	
	this.id = id
	this.type = 'Player'
	this.name = name
	this.faction = 'DuneDweller'
	
	//Basestats
	this.bStats = {
		maxH: 4,
		maxE:4,
		AD : 1,
		MD : 1,
		R : 1,
		CD : 30,
		CR : 0,
		CTR : 0,
		CCT : 1,
		HE : 0
	}
	
	this.stats ={
		H : hp, //Health
		E : en, //Energy
		AD : self.bStats.AD, //AttackDamage
		MD : self.bStats.MD, // Magic Damage
		R : self.bStats.R, //Range
		CD : self.bStats.CD, //Critical Damage
		CR : self.bStats.CR, //Cooldown reduction
		CTR : self.bStats.CTR, //Chargetime reduction
		CCT : self.bStats.CCT, //Crowd control time
		HE : self.bStats.HE //Heal
	}

	//Range
	this.baseRange = 1
	this.range = this.baseRange
	
	//Recharge
	this.baseSR = 3/5
	this.baseER = 1/1
	this.SR = this.baseSR
	this.ER = this.baseER
	
	//Resistances
	this.dotResist = 0
	this.slowResist = 0
	this.shockResist = 0
	this.criticalChanceResist = 0
	
	//luckStats
	this.baseccChance = 15
	this.ccChance = this.baseccChance
	this.baseCriticalChance = 0
	this.criticalChance = this.baseCriticalChance
	
	////////
	
	this.pos = {x:x, y:y, z:z}
	this.vel = {x:0, y:0, z:0}
	this.acc = {x:0, y:0, z:0}
	this.siz = {x:100, y:100, z:200}
	
	this.stationary = true
	this.orientation = 0

	this.buffs = []

	this.inventory = []
	
	this.globalCooldown;
	
	this.spells = {
		slot1:'None',
		slot2:'None',
		slot3:'None',
		slot4:'None',
		slot5:'None',
		slot6:'None',
	}
	
	this.controls = [
		{code : 87 || 38}, //Up
		{code : 83 || 40}, //Down
		{code : 65 || 37}, //Right
		{code : 68 || 39}, //Left
	]
	
	//this.actManager = require('./actManager');
	
	this.onInit = function(){
		
	}
	
	this.addBuff = function (buff, desc, eff, obj){
		self.buffs.push({buff : buff, desc : desc})
		var totTime = 0		
		eff();
	}
	//TODO add attack functionality
	this.attack = function(ori,act){
		
		if (act){
			act && act()
		}
	}

}


exports.player = player;