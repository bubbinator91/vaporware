'use strict';
const db = require('../db');
const vapeRoute = require('./vape');
const vape = require('../vape');
const config = require(process.env.HOME + '/vaporware.json');
const updateConfig = require('../updateConfig');

exports.doStuff = (req, res) => {
	var cmd = {body:{}};
	
	if (req.hasOwnProperty('query') && req.query.hasOwnProperty('action') && req.query.hasOwnProperty('value')) {
		// perform action
		
		vape.then((vapeObj) => {
			if (req.query.action == 'fanSpeed' && req.query.value >= 0 && req.query.value <= 3) {
				cmd.body.fanSpeed = parseInt(req.query.value);
				config.homeBridgeDefaults.fanSpeed = parseInt(req.query.value);
				
				updateConfig.write();
			} else if (req.query.action == 'temp' && req.query.value >= 50 && req.query.value <= 260) {
				cmd.body.temp = parseInt(req.query.value);
				config.homeBridgeDefaults.temp = parseInt(req.query.value);
				
				updateConfig.write();
			} else if (req.query.action == 'duration' && req.query.value >= 0) {
				cmd.body.duration = parseInt(req.query.value);
			} else if (req.query.action == 'fill' && (req.query.value == 0 || req.query.value == 1)) {
				cmd.body.fanSpeed = config.homeBridgeDefaults.fanSpeed;
				if (vapeObj.isPowerOn == 0) cmd.body.temp = config.homeBridgeDefaults.temp;
				cmd.body.isPowerOn = parseInt(req.query.value);
				cmd.body.isFilling = 1;
			} else {
				res.json({});
				return;
			}
			
			vapeRoute.setVape(cmd, res);
		});
	} else if (req.hasOwnProperty('query') && req.query.hasOwnProperty('status') && (req.query.status == 0 || req.query.status == 1)) {
		// return status
		// status = 0 for last bag status
		// status = 1 for non-last bag status
		// returns 0 for off, 1 for on

		vape.then((vapeObj) => {
			if (req.query.status == 0) {
				if (vapeObj.isFilling == 1 && vapeObj.isLastBag == 1) res.json(1);
				else res.json(0);
			} else if (req.query.status == 1) {
				if (vapeObj.isFilling == 1 && vapeObj.isLastBag == 0) res.json(1);
				else res.json(0);
			}
		});
	} else {
		res.json(0);
	}
};