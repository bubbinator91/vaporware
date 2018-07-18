'use strict';
const mysql = require('mysql');
const config = require(process.env.HOME + '/vaporware.json');

var dbPool = mysql.createPool({
	connectionLimit: 10,
	host: config.database.host,
	user: config.database.user,
	password: config.database.password,
	database: config.database.database,
	debug: false
});

exports.query = (req) => {
	if (config.database.enable) {
		return new Promise((resolve, reject) => {
			dbPool.getConnection((err, connection) => {
				if (err) {
					return reject(err);
				}
				
				if (config.debug) console.log(`Performing database query: '${req}'`);
				
				connection.query(req, (err, rows) => {
					connection.release();
					
					if(!err) {
						resolve(rows);
					}
					else {
						return reject(err);
					}
				});
			});
		});
	}
	else {
		return new Promise((resolve, reject) => {
			resolve([]);
		});
	}
};

exports.setValue = (name, value) => {
	return exports.query(`update state set ${name}='${value}'`);
};

exports.getSession = () => {
	return new Promise((resolve, reject) => {
		getActiveSession().then((session) => {
			if (session > 0)
				resolve(session);
			else {
				exports.query("insert into sessions (start) values ('" + exports.getDbDateTime() + "')").then((result) => {
					getActiveSession().then((newSession) => {
						resolve(newSession);
					},
					(reason) => {
						return reject(reason);
					});
				},
				(reason) => {
					return reject(reason);
				});
			}
		},
		(reason) => {
			return reject(reason);
		});
	});
};

exports.endSession = () => {
	return new Promise((resolve, reject) => {
		exports.getSession().then((session) => {
			exports.query("update sessions set end = '" + exports.getDbDateTime() + "' where id = " + session).then((result) => {
				resolve(result);
			},
			(reason) => {
				return reject(reason);
			});
		},
		(reason) => {
			return reject(reason);
		});
	});
};

exports.writeBag = (startDateTime, endDateTime) => {
	return new Promise((resolve, reject) => {
		exports.getSession().then((session) => {
			exports.query(`insert into bags (sessionID, start, end) values (` + session + `, '${startDateTime}', '${endDateTime}')`).then((result) => {
				resolve(result);
			},
			(reason) => {
				return reject(reason);
			});
		},
		(reason) => {
			return reject(reason);
		});
	});
};

exports.getDbDateTime = () => {
	var d = new Date();
	return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate() + ' ' + d.getHours() + ':' + d.getMinutes() + ':' + d.getSeconds();
}

function getActiveSession() {
	// create new promise so that we can do some additional processing before eventually returning a property
	return new Promise((resolve, reject) => {
		exports.query('select id from sessions where end is null').then((value) => {
			if (value.length > 0 && value[0].hasOwnProperty('id'))
				resolve(value[0].id);
			else
				resolve(null);
		},
		(reason) => {
			return reject(reason);
		});
	});
}