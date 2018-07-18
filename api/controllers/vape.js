'use strict';
const db = require('../db');
const vape = require('../vape');
const config = require(process.env.HOME + '/vaporware.json');
const updateConfig = require('../updateConfig');

var lastEndTime = 0; // kept for seeing if new bag is started right after previous bag

exports.getStatus = (req, res) => {	
	vape.then((vapeObj) => {
		res.json(vapeObj);
	});
};

exports.setVape = (req, res) => {
	var setting = req.body;
	
	if (config.debug) console.log(setting);
	
	vape.then((vapeObj) => {
		// validation
		
		if ((setting.hasOwnProperty('isPowerOn') && !(setting.isPowerOn == 0 || setting.isPowerOn == 1)) || 
		(setting.hasOwnProperty('isAudioOn') && !(setting.isAudioOn == 0 || setting.isAudioOn == 1)) || 
		(setting.hasOwnProperty('fanSpeed') && !(setting.fanSpeed == 0 || setting.fanSpeed == 1 || setting.fanSpeed == 2 || setting.fanSpeed == 3)) || 
		(setting.hasOwnProperty('temp') && !(setting.temp >= 50 && setting.temp <= 260)) || 
		(setting.hasOwnProperty('duration') && !(setting.duration >= 0 && setting.duration <= 300)) || 
		(setting.hasOwnProperty('durationElapsed') && !(setting.durationElapsed >= 0 && setting.durationElapsed <= 300)) || 
		(setting.hasOwnProperty('isFilling') && !(setting.isFilling == 0 || setting.isFilling == 1)) || 
		(setting.hasOwnProperty('cleanAge') && !(setting.cleanAge >= 0))) {
			res.json({ message: 'Validation error' });
			return;
		}
		
		// do work!
		if (setting.isFilling == 1 && vapeObj.isFilling == 0) {
			// instructed to start filling bag
			
			if (setting.hasOwnProperty('temp') && setting.hasOwnProperty('fanSpeed')) {
				// required properties present
				
				var fillDelay = 0;
				var starting = false;
				
				if (vapeObj.isPowerOn != 1) {
					starting = true;
					fillDelay = config.sleeps.heatUp; // wait for vape to heat up before filling bag if it wasn't on before
					vapeObj.isPowerOn = 1;
				}
				
				if (starting || vapeObj.temp != setting.temp) vapeObj.temp = setting.temp;
				
				vapeObj.isFilling = 1;
			
				// if isPowerOn was provided and set to 0, mark as last bag
				if (setting.hasOwnProperty('isPowerOn') && setting.isPowerOn == 0)
					vapeObj.isLastBag = 1;
				else
					vapeObj.isLastBag = 0;
				
				if (starting) {
					// reset durationElapsed to 0
					vapeObj.durationElapsed = 0;
					
					// heat run loop
					var heatTimer = setInterval(() => {
						vapeObj.durationElapsed++;
						
						// stop when elapsed time >= full time
						if (vapeObj.durationElapsed >= fillDelay) {
							clearInterval(heatTimer);
							
							// start bag logic
							startVape(setting, vapeObj);
						}
					}, 1000);
				} else {
					// start bag logic
					startVape(setting, vapeObj);
				}
				
				res.json({ message: 'Enjoy!' });
			}
			else {
				// required properties not present
				res.json({ message: 'Unable to initiate happiness' });
			}
		}
		else {
			// just changing settings
			// only allow changes if power is on or turning on
			// unless override is true, then perform special logic
			if (setting.hasOwnProperty('cleanAge'))
				vapeObj.cleanAge = parseInt(setting.cleanAge);
			
			if (setting.hasOwnProperty('override') && setting.override == 1) {
				// do special logic for the properties being changed
				// ignore other properties
				
				if (setting.hasOwnProperty('isPowerOn'))
					vapeObj.setPower(parseInt(setting.isPowerOn), true);
					
				if (setting.hasOwnProperty('isAudioOn'))
					vapeObj.setAudio(parseInt(setting.isAudioOn), true);
			}
			else if (vapeObj.isPowerOn == 1 || (setting.hasOwnProperty('isPowerOn') && setting.isPowerOn == 1)) {
				// do the needful
				
				if (!setting.hasOwnProperty('isPowerOn') || (setting.hasOwnProperty('isPowerOn') && setting.isPowerOn == 1)) {
					// power is either not being changed, or is being turned on
					
					if (vapeObj.isFilling == 0 && setting.hasOwnProperty('isPowerOn')) // don't allow changing power if we're filling
						vapeObj.isPowerOn = parseInt(setting.isPowerOn);
						
					if (setting.hasOwnProperty('isAudioOn'))
						vapeObj.isAudioOn = parseInt(setting.isAudioOn);
						
					if (setting.hasOwnProperty('temp'))
						vapeObj.temp = parseInt(setting.temp);
					
					if (vapeObj.isFilling == 1) {
						// these settings only valid if bag is already filling
						
						if (setting.hasOwnProperty('fanSpeed') && vapeObj.fanSpeed > 0) // only adjust fan speed if it's actually on
							vapeObj.fanSpeed = parseInt(setting.fanSpeed);
							
						if (setting.hasOwnProperty('duration'))
							vapeObj.duration = parseInt(setting.duration);
							
						if (setting.hasOwnProperty('durationElapsed'))
							vapeObj.durationElapsed = parseInt(setting.durationElapsed);
					}
				}
				else if (!(setting.hasOwnProperty('isFilling') && setting.isFilling == 1) && !vapeObj.isFilling) {
					// power is being turned off, so ignore other settings
					// only turn off if we aren't being told to start filling a bag (then do nothing, because we must be in the process of filling a bag and were just told to start a last bag, can't start a bag that's already going!)
					
					vapeObj.isPowerOn = parseInt(setting.isPowerOn);
				}
			}
					
			res.json({ message: 'All set!' });
		}
	});
};

function startVape(setting, vapeObj) {
	// reset durationElapsed to 0
	vapeObj.durationElapsed = 0;
	
	// get start datetime for database and feedback
	var startDbDateTime = db.getDbDateTime();
	var startDateTime = Date.now();
	
	// set fan
	vapeObj.fanSpeed = parseInt(setting.fanSpeed);
	
	// calculate duration
	vapeObj.duration = Math.ceil(config.fill.baseline + ((2 - vapeObj.fanSpeed) * config.fill.speedBias) + (config.fill.cleanBias * Math.log(vapeObj.cleanAge + 1)));
	// defaults: baseline 120s clean at speed 2, speed bias 25, cleaning bias 3
	
	// save copy of the duration so we can compare initial vs. actual later on
	let vapeCopy = Object.assign({}, vapeObj);
	
	// fill run loop
	var fillTimer = setInterval(() => {
		vapeObj.durationElapsed++;
		
		// stop when elapsed time >= full time
		if (vapeObj.durationElapsed >= vapeObj.duration) {
			// bag is full now
			clearInterval(fillTimer);
	
			// stop fan
			vapeObj.fanSpeed = 0;
			
			// set isFilling to 0
			vapeObj.isFilling = 0;
			
			// increase cleaning age
			vapeObj.makeDirtier();
			
			// beep
			vapeObj.alert();
			
			// get end datetime for database
			var endDbDateTime = db.getDbDateTime();
			
			// if last bag, turn off power
			if (vapeObj.isLastBag == 1) vapeObj.isPowerOn = 0;
			
			// adjust baseline in config if enabled
			if (config.fill.autoAdjust) {
				var diff = 0;
				var bagGap = Math.floor((startDateTime - lastEndTime) / 1000);
				
				if (config.debug) console.log(`Bag gap was ${bagGap} seconds`);
				
				if (bagGap <= 10 && bagGap >= 0) {
					// this bag started <= 10sec after the previous bag ended. Add this bag's duration to the baseline if it was a short bag.
					// (we probably stopped too early previous bag)
					// skip writing to db
					diff = vapeObj.durationElapsed;
					
					if (config.debug) console.log(`Appending total bag time of ${diff} to baseline`)
				} else {
					// write bag to database
					if (config.database.enable) db.writeBag(startDbDateTime, endDbDateTime);
					
					// get difference between actual vs expected bag time
					var diff = vapeObj.durationElapsed - vapeCopy.duration;
					
					if (config.debug) console.log(`Baseline difference: ${diff}`);
				}
					
				// update config
				if (Math.abs(diff) > 1) {
					config.fill.baseline += diff;
					updateConfig.write();
					
					if (config.debug) console.log(`Updated config with new baseline ${config.fill.baseline}`);
				}
			} else {
				// write bag to database
				if (config.database.enable) db.writeBag(startDbDateTime, endDbDateTime);
			}
			
			// set end time for feedback
			lastEndTime = Date.now();
		}
	}, 1000);
}