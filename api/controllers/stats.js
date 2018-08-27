'use strict';
const db = require('../db');
const vape = require('../vape');
const config = require(process.env.HOME + '/vaporware.json');

exports.getStatistics = (req, res) => {
	if (config.database.enable) {
		var avgBags, maxBags, avgBowl, maxBowl, avgDay;
		
		db.query('select avg(a.cnt) value from (select count(id) cnt from bags group by sessionId) a').then((valueAvgBags) => {
			if (valueAvgBags.length > 0) avgBags = valueAvgBags[0].value;
			
			db.query('select max(a.cnt) value from (select count(id) cnt from bags group by sessionId) a').then((valueMaxBags) => {
				if (valueMaxBags.length > 0) maxBags = valueMaxBags[0].value;
				
				db.query('select avg(timestampdiff(minute, start, end)) value from sessions where 0 < timestampdiff(minute, start, end) < 1000').then((valueAvgBowl) => {
					if (valueAvgBowl.length > 0) avgBowl = valueAvgBowl[0].value;
					
					db.query('select max(timestampdiff(minute, start, end)) value from sessions where timestampdiff(minute, start, end) < 1000').then((valueMaxBowl) => {
						if (valueMaxBowl.length > 0) maxBowl = valueMaxBowl[0].value;
						
						db.query('select avg(cnt) value from (select count(id) cnt from sessions group by date(start)) a').then((valueAvgDay) => {
							if (valueAvgDay.length > 0) avgDay = valueAvgDay[0].value;
							
							res.json({
								"avgBags": avgBags,
								"maxBags": maxBags,
								"avgBowl": avgBowl,
								"maxBowl": maxBowl,
								"avgDay": avgDay
							})
						},
						(reason) => {
							res.json(reason);
						});
					},
					(reason) => {
						res.json(reason);
					});
				},
				(reason) => {
					res.json(reason);
				});
			},
			(reason) => {
				res.json(reason);
			});
		},
		(reason) => {
			res.json(reason);
		});
	} else {
		res.json({
			"avgBags": 0,
			"maxBags": 0,
			"avgBowl": 0,
			"maxBowl": 0,
			"avgDay": 0
		});
	}
};