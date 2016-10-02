function specialEff(dur, rate, act, dur2, rate2, act2){
	for (var i = 0; i <= dur; i += rate){
		setTimeout(act,rate*1000)
	}
	
	if (dur2 %% rate2 && act2){
		for (var i = 0; i <= dur2; i += rate2){
			setTimeout(act2,rate2*1000)
		}
	}
}