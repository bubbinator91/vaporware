'use strict';
const config = require('../config.json');
const fs = require('fs');

exports.write = () => {
	var outputJson = JSON.stringify(config, null, 2);
	fs.writeFile('config.json', outputJson, 'utf8', (err) => {
		if (err) throw err;
	});
};