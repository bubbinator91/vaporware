'use strict';
module.exports = (app) => {
	var vape = require('./controllers/vape');
	var stats = require('./controllers/stats');
	var config = require('./controllers/config');
	var homebridge = require('./controllers/homebridge');
	
	app.route('/vape')
		.get(vape.getStatus)
		.put(vape.setVape);

	app.route('/stats')
		.get(stats.getStatistics);

	app.route('/config')
		.get(config.getConfig)
		.put(config.setConfig);

	app.route('/homebridge')
		.get(homebridge.doStuff);
};