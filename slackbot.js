const config = require(process.env.HOME + '/vaporware.json');
const { RTMClient } = require('@slack/client');
const homebridge = require('./api/controllers/homebridge');
let rtm;

exports.start = () => {
	if (config.hasOwnProperty('slackbot') && config.slackbot.enable) {
		rtm = new RTMClient(config.slackbot.apiToken);
		rtm.start();
		
		rtm.on('authenticated', onAuthenticated);
		rtm.on('ready', onConnected);
		rtm.on('message', onMessage);
	}
};

exports.postMessage = (message) => {
	if (config.hasOwnProperty('slackbot') && config.slackbot.enable) {
		rtm.sendMessage(message, config.slackbot.channelId)
		.then((res) => {
			if (config.debug) console.log('Slack message sent: ', res.ts);
		})
		.catch(console.error);
	}
};

function onAuthenticated(rtmStartData) {
	if (config.debug) console.log(`Slackbot logged in as ${rtmStartData.self.name} of team ${rtmStartData.team.name}`);
}

function onConnected() {
	if (config.debug) module.exports.postMessage('Vaporware is running.');
}

function onMessage(message) {
	if(message.channel === config.slackbot.channelId && config.slackbot.allowedMembers.indexOf(message.user) > -1) {
		switch (message.text) {
			case '!help':
				module.exports.postMessage('Commands: !vape !lastbag !stop');
				break;
			case '!vape':
				var req = {
					query: {
						action: 'fill',
						value: 1
					}
				};
				homebridge.doStuff(req, null);
				break;
			case '!lastbag':
				var req = {
					query: {
						action: 'fill',
						value: 0
					}
				};
				homebridge.doStuff(req, null);
				break;
			case '!stop':
				var req = {
					query: {
						action: 'duration',
						value: 0
					}
				};
				homebridge.doStuff(req, null);
				break;
			default:
		}
	}
}