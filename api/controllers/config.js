'use strict';
const config = require('../../config.json');
const updateConfig = require('../updateConfig');

exports.getConfig = (req, res) => {
	var userSettings = {};
	
	userSettings.alerting = config.alerting;
	userSettings.fill = config.fill;
	userSettings.sleeps = config.sleeps;
	userSettings.homeBridgeDefaults = config.homeBridgeDefaults;
	
	res.json(userSettings);
};

exports.setConfig = (req, res) => {
	var setting = req.body;
	
	if (setting.hasOwnProperty('alerting')) {
		if (setting.alerting.hasOwnProperty('audible')) config.alerting.audible = setting.alerting.audible;
		if (setting.alerting.hasOwnProperty('visual')) config.alerting.visual = setting.alerting.visual;
	}
	
	if (setting.hasOwnProperty('fill')) {
		if (setting.fill.hasOwnProperty('autoAdjust')) config.fill.autoAdjust = setting.fill.autoAdjust;
		if (setting.fill.hasOwnProperty('baseline')) config.fill.baseline = setting.fill.baseline;
		if (setting.fill.hasOwnProperty('speedBias')) config.fill.speedBias = setting.fill.speedBias;
		if (setting.fill.hasOwnProperty('cleanBias')) config.fill.cleanBias = setting.fill.cleanBias;
		if (setting.fill.hasOwnProperty('timeIncrementSeconds')) config.fill.timeIncrementSeconds = setting.fill.timeIncrementSeconds;
	}
	
	if (setting.hasOwnProperty('sleeps')) {
		if (setting.sleeps.hasOwnProperty('command')) config.sleeps.command = setting.sleeps.command;
		if (setting.sleeps.hasOwnProperty('tempCommand')) config.sleeps.tempCommand = setting.sleeps.tempCommand;
		if (setting.sleeps.hasOwnProperty('heatUp')) config.sleeps.heatUp = setting.sleeps.heatUp;
	}
	
	if (setting.hasOwnProperty('homeBridgeDefaults')) {
		if (setting.homeBridgeDefaults.hasOwnProperty('fanSpeed')) config.homeBridgeDefaults.fanSpeed = setting.homeBridgeDefaults.fanSpeed;
		if (setting.homeBridgeDefaults.hasOwnProperty('temp')) config.homeBridgeDefaults.temp = setting.homeBridgeDefaults.temp;
	}
	
	updateConfig.write();
	
	res.json({ message: 'All set!' });
};