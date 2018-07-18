'use strict';
const config = require(process.env.HOME + '/vaporware.json');
const fs = require('fs');

exports.write = () => {
	var outputJson = JSON.stringify(config, null, 2);
	fs.writeFile(process.env.HOME + '/vaporware.json', outputJson, 'utf8', (err) => {
		if (err) throw err;
	});
};