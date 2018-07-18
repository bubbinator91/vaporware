'use strict';
const db = require('./db');
const runner = require('./runner');
const config = require('../config.json');

var cache = {
	isPowerOn: 0,
	isAudioOn: 0,
	fanSpeed: 0,
	temp: 0,
	cleanAge: 0,
	isFilling: 0,
	duration: 0
};

var vapePromise = new Promise((resolve, reject) => {
	db.query('select * from state').then((value) => {
		if (config.database.enable) cache = value[0];
		
		// add application variables
		cache.durationElapsed = 0;
		cache.isLastBag = 0;
		
		var vape = {};
		
		// define getters and setters for each property
		// getters just return value from the cache
		// setters perform additional logic within a promise to not block execution
		
		Object.defineProperties(vape, {
			isPowerOn: {
				enumerable: true,
				get: () => {
					return cache.isPowerOn;
				},
				set: (value) => {
					vape.setPower(value, false);
				}
			},
			isAudioOn: {
				enumerable: true,
				get: () => {
					return cache.isAudioOn;
				},
				set: (value) => {
					vape.setAudio(value, false);
				}
			},
			fanSpeed: {
				enumerable: true,
				get: () => {
					return cache.fanSpeed;
				},
				set: (value) => {
					vape.setFan(value);
				}
			},
			temp: {
				enumerable: true,
				get: () => {
					return cache.temp;
				},
				set: (value) => {
					vape.setTemp(value);
				}
			},
			cleanAge: {
				enumerable: true,
				get: () => {
					return cache.cleanAge;
				},
				set: (value) => {
					vape.setValue('cleanAge', value);
				}
			},
			isFilling: {
				enumerable: true,
				get: () => {
					return cache.isFilling;
				},
				set: (value) => {
					vape.setValue('isFilling', value);
				}
			},
			isLastBag: {
				enumerable: true,
				get: () => {
					return cache.isLastBag;
				},
				set: (value) => {
					cache.isLastBag = value;
				}
			},
			duration: {
				enumerable: true,
				get: () => {
					return cache.duration;
				},
				set: (value) => {
					vape.setValue('duration', value);
				}
			},
			durationElapsed: {
				enumerable: true,
				get: () => {
					return cache.durationElapsed;
				},
				set: (value) => {
					cache.durationElapsed = value;
					if (config.debug) console.log('Duration elapsed: ' + cache.durationElapsed);
				}
			}
		});
		
		
		// reusable function for updating values
		
		vape.setValue = (prop, value) => {
			cache[prop] = value;
			if (config.database.enable) db.setValue(prop, value);
		};
		
		
		// helper functions
		
		vape.alert = () => {
			if (config.alerting.audible && vape.isAudioOn == 0) {
				// audible alerts only used if audio is already off
				vape.setAudio(1, false);
				vape.setAudio(0, false);
			}
			if (config.alerting.visual) {
				runner.execute('LIGHT');
				runner.execute('LIGHT');
			}
		};
		
		vape.makeDirtier = () => {
			vape.setValue('cleanAge', cache.cleanAge + 1);
		};
		
		vape.clean = () => {
			vape.setValue('cleanAge', 0);
		};
		
		vape.upTemp = (startTemp, endTemp) => {
			runner.execute('TEMP' + startTemp);
			var i;
			for (i = 0; i < (endTemp - startTemp); i++)
			{
				// increase temp
				runner.execute('TEMPUP');
			}
		};

		vape.downTemp = (startTemp, endTemp) => {
			runner.execute('TEMP' + startTemp);
			var i;
			for (i = 0; i < (startTemp - endTemp); i++)
			{
				// decrease temp
				runner.execute('TEMPDOWN');
			}
		};
		
		
		// vape functions
		
		vape.setAudio = (setOn, force) => {
			if (!force && vape.isAudioOn == setOn) return; // only do something if current state != setting
			
			runner.execute('AUDIO');
			
			vape.setValue('isAudioOn', setOn);
		};
		
		vape.setFan = (speed) => {
			runner.execute('FAN' + speed);
			runner.execute('FAN' + speed); // yes, send it twice just in case
			
			vape.setValue('fanSpeed', speed);
		};
		
		vape.setPower = (setOn, force) => {
			if (!force && vape.isPowerOn == setOn) return; // only do something if current state != setting
			
			// create or end session in the database
			if (config.database.enable)
			{
				if (setOn == 1)
					db.getSession();
				else if (vape.isPowerOn)
					db.endSession();
			}
			
			runner.execute('POWER');
			
			vape.setValue('isPowerOn', setOn);
		};
		
		vape.setTemp = (setTemp) => {
			if (setTemp >= 230)
				vape.upTemp(230, setTemp);
			else if (setTemp >= 220)
				vape.upTemp(220, setTemp);
			else if (setTemp >= 210)
				vape.upTemp(210, setTemp);
			else if (setTemp >= 200)
				vape.upTemp(200, setTemp);
			else
				vape.downTemp(200, setTemp);
			
			vape.setValue('temp', setTemp);
		};
		
		resolve(vape);
	},
	(reason) => {
		reject(reason);
	});
});

module.exports = vapePromise;