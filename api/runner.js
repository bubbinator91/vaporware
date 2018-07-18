'use strict';
const { exec } = require('child_process');
const config = require('../config.json');
var queue = [];
var ready = true;

function run() {
	if (queue.length === 0 || !ready) return;
	
	ready = false;
	var action = queue[0];
	var timeout = config.sleeps.command;
	if (action.startsWith('TEMP')) timeout = config.sleeps.tempCommand;
	
	exec(`irsend send_once ${config.ir} ${action}`);
	if (config.debug) console.log(action);
	
	queue.shift();
	setTimeout(() => {
		ready = true;
		run();
	}, timeout);
}

exports.execute = (action) => {
	/* Possible commands:
			AUDIO
			FAN0
			FAN1
			FAN2
			FAN3
			LIGHT
			POWER
			TEMPUP
			TEMPDOWN
			TEMP200
			TEMP210
			TEMP220
			TEMP230
			TIME0
			TIME2
			TIME4
			*/
	queue.push(action);
	run();
}